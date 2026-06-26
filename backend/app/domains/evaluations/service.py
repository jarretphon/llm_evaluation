import uuid
from datetime import UTC, datetime

import pandas as pd
import numpy as np

from functools import lru_cache

import lm_eval
from app.domains.evaluations.errors import (
    EvaluationNotFoundError,
    NoBenchmarksSelectedError,
)
from app.domains.evaluations.models import (
    BenchmarkModel,
    EvaluationMetadata,
    EvaluationModel,
    EvaluationStatus,
    utc_now,
)
from app.domains.evaluations.repository import EvaluationRepository
from app.domains.evaluations.schemas import EvaluationCreate
from app.domains.evaluations.traversal import get_root_groups
from app.domains.evaluations.utils import get_group_tasks, require_completions
from lm_eval.tasks import TaskManager


DEFAULT_EVALUATION_MODEL_NAME = "default"


class EvaluationService:
    def __init__(self, repository: EvaluationRepository) -> None:
        self.repository = repository

    @lru_cache(maxsize=1)
    def get_task_manager(self) -> TaskManager:
        return TaskManager()

    def list_benchmark_options(self) -> dict[str, list[str]]:
        return get_root_groups(self.get_task_manager())

    def list_evaluations(
        self, offset: int = 0, limit: int = 10
    ) -> list[EvaluationModel]:
        return self.repository.list_evaluations(offset=offset, limit=limit)

    def get_evaluation(self, evaluation_id: uuid.UUID) -> EvaluationModel:
        evaluation = self.repository.get_by_id(evaluation_id)

        if evaluation is None:
            raise EvaluationNotFoundError(evaluation_id)

        return evaluation

    def create_evaluation(self, evaluation_create: EvaluationCreate) -> EvaluationModel:
        if not evaluation_create.benchmarks:
            raise NoBenchmarksSelectedError()

        evaluation = EvaluationModel(
            llm_id=evaluation_create.model_id,
            metadata_entry=EvaluationMetadata(),
            benchmarks= [
                BenchmarkModel(name=benchmark) for benchmark in evaluation_create.benchmarks
            ]
        )

        self.repository.create_evaluation(evaluation)
        return evaluation

    def start_registered_evaluation(self, evaluation_id: uuid.UUID) -> EvaluationModel:
        evaluation = self.get_evaluation(evaluation_id)
        self._set_status(evaluation, EvaluationStatus.RUNNING)
        evaluation.metadata_entry.started_at = utc_now()
        self.repository.save_evaluation(evaluation)
        return evaluation

    def run_registered_evaluation(self, evaluation_id: uuid.UUID) -> EvaluationModel:
        evaluation = self.get_evaluation(evaluation_id)
       
        model_endpoint = evaluation.llm_entry.endpoint
        model_name = DEFAULT_EVALUATION_MODEL_NAME
        benchmark_tasks = [
            (benchmark, self.get_subtasks([benchmark.name]))
            for benchmark in evaluation.benchmarks
        ]

        total_tasks = sum(len(task_list) for _, task_list in benchmark_tasks)
        num_tasks_evaluated = 0

        for benchmark, task_list in benchmark_tasks:
            self._set_status(benchmark, EvaluationStatus.RUNNING)
            self.repository.save_evaluation(evaluation)

            benchmark_results = {}

            for task in task_list:
                try:
                    eval_results = self._run_lm_eval(
                        base_url=model_endpoint,
                        model_name=model_name,
                        task=task
                    )
                except Exception as e:
                    print(
                        f"Error occurred while running LM eval for benchmark {benchmark.name}: {e}"
                    )
                    benchmark_results[task] = {"error": True, "results": {}} 
                else:
                    benchmark_results[task] = {
                        "error": False,
                        "results": eval_results.get("results", {}).get(task, {}),
                    }
            
                num_tasks_evaluated += 1
                self._update_evaluation_progress(
                    evaluation, total_tasks, num_tasks_evaluated
                )
             
            status, aggregate_results = self.aggregate_results(benchmark_results)
            self._set_status(benchmark, status)
            benchmark.results = aggregate_results

        final_status = self._get_final_evaluation_status(evaluation.benchmarks)
        self._complete_evaluation(evaluation, final_status)
        self.repository.save_evaluation(evaluation)

        return evaluation

    def _run_lm_eval(self, base_url: str, model_name: str, task: str):
        model_args = {
            "model": model_name,
            "base_url": base_url,
        }

        if require_completions(task):
            results = lm_eval.simple_evaluate(
                model="local-completions",
                model_args=model_args,
                tasks=[task],
            )
        else:
            results = lm_eval.simple_evaluate(
                model="local-chat-completions",
                model_args=model_args,
                tasks=[task],
                apply_chat_template=True,
            )
        return results

    def _set_status(
        self, model: EvaluationModel | BenchmarkModel, status: EvaluationStatus
    ) -> None:
        model.status = status
        if isinstance(model, EvaluationModel):
            model.metadata_entry.evaluation_status = status

    def _complete_evaluation(
        self, evaluation: EvaluationModel, status: EvaluationStatus
    ) -> None:
        completed_at = utc_now()
        started_at = self._to_aware_utc(evaluation.metadata_entry.started_at)

        self._set_status(evaluation, status)
        evaluation.metadata_entry.completed_at = completed_at
        evaluation.metadata_entry.duration = (completed_at - started_at).total_seconds()
        evaluation.metadata_entry.progress = 100.0
        self.repository.save_evaluation(evaluation)

    def _to_aware_utc(self, value: datetime) -> datetime:
        if value.tzinfo is None:
            return value.replace(tzinfo=UTC)

        return value.astimezone(UTC)

    def _get_final_evaluation_status(
        self, benchmarks: list[BenchmarkModel]
    ) -> EvaluationStatus:
        if not benchmarks:
            return EvaluationStatus.COMPLETED

        num_failed = sum(
            benchmark.status == EvaluationStatus.FAILED for benchmark in benchmarks
        )

        if num_failed == len(benchmarks):
            return EvaluationStatus.FAILED

        if num_failed > 0:
            return EvaluationStatus.PARTIAL_FAILED

        return EvaluationStatus.COMPLETED

    def _update_evaluation_progress(
        self,
        evaluation: EvaluationModel,
        total: int,
        num_evaluated: int,
    ) -> None:
        progress = round((num_evaluated / total) * 100)
        evaluation.metadata_entry.progress = progress
        self.repository.save_evaluation(evaluation)

    def get_subtasks(self, groups: list[str]) -> list[str]:
        subtasks = []
        for group_name in groups:
            subtasks.extend(get_group_tasks(group_name, self.get_task_manager()))
        return subtasks


    def aggregate_results(self, results: dict[str, dict]) -> dict:
       
        any_failed = any(result["error"] for result in results.values())
        all_failed = all(result["error"] for result in results.values())

        if all_failed:
            status = EvaluationStatus.FAILED
        elif any_failed:
            status = EvaluationStatus.PARTIAL_FAILED
        else:
            status = EvaluationStatus.COMPLETED

        valid_records = [v["results"] for v in results.values() if not v["error"]]
        df = pd.DataFrame(valid_records)
        total_tasks = len(df)

        stderr_cols = [col for col in df.columns if col.endswith(",stderr")]
        score_cols = [col for col in df.columns if col not in stderr_cols]

        aggregated_scores = df[score_cols].mean()
        aggregated_stderrs = np.sqrt((df[stderr_cols] ** 2).sum(axis=0)) / total_tasks
        
        final_results = pd.concat([aggregated_scores, aggregated_stderrs]).round(5).to_dict()
        
        return status, final_results
        
