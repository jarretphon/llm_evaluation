import uuid
from typing import Any

import lm_eval
from app.domains.evaluations.errors import EvaluationNotFoundError
from app.domains.evaluations.models import (
    BenchmarkModel,
    EvaluationMetadata,
    EvaluationModel,
    EvaluationStatus,
)
from app.domains.evaluations.repository import EvaluationRepository
from app.domains.evaluations.schemas import EvaluationCreate
from app.domains.evaluations.traversal import get_root_groups
from app.domains.evaluations.utils import require_completions
from lm_eval.tasks import TaskManager


class EvaluationService:
    def __init__(self, repository: EvaluationRepository) -> None:
        self.repository = repository
        self.task_manager = TaskManager()

    def list_benchmark_options(self) -> dict[str, list[str]]:
        return get_root_groups(self.task_manager)

    def list_evaluations(
        self, offset: int = 0, limit: int = 10
    ) -> list[EvaluationModel]:
        return self.repository.list_evaluations(offset=offset, limit=limit)

    def get_evaluation(self, evaluation_id: uuid.UUID) -> EvaluationModel:
        evaluation = self.repository.get_by_id(evaluation_id)

        if evaluation is None:
            raise EvaluationNotFoundError(evaluation_id)

        return evaluation

    def create_evaluation(
        self, llm_id: uuid.UUID, evaluation_create: EvaluationCreate
    ) -> EvaluationModel:
        evaluation = EvaluationModel(
            llm_id=llm_id,
            metadata_entry=EvaluationMetadata(),
            benchmarks=[
                BenchmarkModel(name=benchmark.name, description=benchmark.description)
                for benchmark in evaluation_create.benchmarks
            ],
        )

        self.repository.create_evaluation(evaluation)
        return evaluation

    def start_evaluation(
        self, evaluation: EvaluationModel, evaluation_create: EvaluationCreate
    ) -> EvaluationModel:

        self._set_status(evaluation, EvaluationStatus.RUNNING)
        total_benchmarks = len(evaluation.benchmarks)
        num_benchmarks_evaluated = 0

        for benchmark in evaluation.benchmarks:
            self._set_status(benchmark, EvaluationStatus.RUNNING)
            try:
                eval_results = self._run_lm_eval(
                    base_url=evaluation_create.model_endpoint,
                    model_name=evaluation_create.model_name,
                    task=benchmark.name,
                )
            except Exception as e:
                print(
                    f"Error occurred while running LM eval for benchmark {benchmark.name}: {e}"
                )
                self._set_status(benchmark, EvaluationStatus.FAILED)
            else:
                self._set_status(benchmark, EvaluationStatus.COMPLETED)
                self._update_benchmark_results(eval_results.get("results", {}))

            num_benchmarks_evaluated += 1
            self._update_evaluation_progress(
                evaluation, total_benchmarks, num_benchmarks_evaluated
            )

        self._set_status(evaluation, EvaluationStatus.COMPLETED)

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

    def _update_benchmark_results(
        self, benchmark_result: dict[str, Any]
    ) -> float | None:
        for metric_name, value in benchmark_result.items():
            if metric_name.endswith("_stderr"):
                continue
            if isinstance(value, int | float):
                return float(value)
        return None

    def _update_evaluation_progress(
        self,
        evaluation: EvaluationModel,
        total_tasks: int,
        num_evaluated: int,
    ) -> None:
        if total_tasks == 0:
            evaluation.metadata_entry.progress = 100.0
        else:
            evaluation.metadata_entry.progress = (num_evaluated / total_tasks) * 100
        self.repository.save_evaluation(evaluation)
