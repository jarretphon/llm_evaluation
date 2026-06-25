import uuid
from datetime import UTC, datetime

import lm_eval
from app.domains.evaluations.errors import EvaluationNotFoundError
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

    def create_evaluation(self, evaluation_create: EvaluationCreate) -> EvaluationModel:
        benchmark_names = self.get_subtasks(evaluation_create.benchmarks)

        evaluation = EvaluationModel(
            llm_id=evaluation_create.model_id,
            metadata_entry=EvaluationMetadata(),
            benchmarks=[
                BenchmarkModel(name=benchmark_name)
                for benchmark_name in benchmark_names
            ],
        )

        self.repository.create_evaluation(evaluation)
        return evaluation

    def start_evaluation(
        self, evaluation: EvaluationModel, evaluation_create: EvaluationCreate
    ) -> EvaluationModel:

        evaluation.metadata_entry.started_at = utc_now()
        evaluation.metadata_entry.completed_at = None
        evaluation.metadata_entry.duration = 0.0
        self._set_status(evaluation, EvaluationStatus.RUNNING)
        self.repository.save_evaluation(evaluation)
        total_benchmarks = len(evaluation.benchmarks)
        num_benchmarks_evaluated = 0

        for benchmark in evaluation.benchmarks:
            self._set_status(benchmark, EvaluationStatus.RUNNING)
            self.repository.save_evaluation(evaluation)
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
                benchmark.results = eval_results.get("results", {}).get(
                    benchmark.name, {}
                )

            num_benchmarks_evaluated += 1
            self._update_evaluation_progress(
                evaluation, total_benchmarks, num_benchmarks_evaluated
            )

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
        total_tasks: int,
        num_evaluated: int,
    ) -> None:
        if total_tasks == 0:
            evaluation.metadata_entry.progress = 100.0
        else:
            evaluation.metadata_entry.progress = (num_evaluated / total_tasks) * 100
        self.repository.save_evaluation(evaluation)

    def get_subtasks(self, groups: list[str]) -> list[str]:
        subtasks = []
        for group_name in groups:
            subtasks.extend(get_group_tasks(group_name, self.task_manager))
        return subtasks
