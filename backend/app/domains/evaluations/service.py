import uuid
from datetime import UTC, datetime
from functools import lru_cache

from app.domains.evaluations.aggregator import (
    aggregate_results,
    build_benchmark_metrics,
)
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
from app.domains.evaluations.notifications import publish_evaluation_update
from app.domains.evaluations.parser import (
    get_effective_sample_count,
    get_task_metric_results,
)
from app.domains.evaluations.repository import EvaluationRepository
from app.domains.evaluations.runner import run_lm_eval
from app.domains.evaluations.schemas import EvaluationCreate
from app.domains.evaluations.traversal import get_root_groups
from app.domains.evaluations.utils import get_group_tasks
from lm_eval.tasks import TaskManager


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
            benchmarks=[
                BenchmarkModel(name=benchmark)
                for benchmark in evaluation_create.benchmarks
            ],
        )

        self.repository.create_evaluation(evaluation)
        return evaluation

    def run_registered_evaluation(self, evaluation_id: uuid.UUID) -> EvaluationModel:
        evaluation = self.get_evaluation(evaluation_id)

        self.repository.update_evaluation(evaluation, status=EvaluationStatus.RUNNING)
        self.repository.save_evaluation(evaluation)
        self.broadcast_update(evaluation)

        model_endpoint = evaluation.llm_entry.endpoint
        model_name = evaluation.llm_entry.name
        benchmark_tasks = [
            (benchmark, self.get_subtasks([benchmark.name]))
            for benchmark in evaluation.benchmarks
        ]

        total_tasks = sum(len(task_list) for _, task_list in benchmark_tasks)
        num_tasks_evaluated = 0

        for benchmark, task_list in benchmark_tasks:
            self.repository.update_benchmark(benchmark, status=EvaluationStatus.RUNNING)
            self.repository.save_evaluation(evaluation)

            benchmark_results = {}

            for task in task_list:
                try:
                    eval_results = run_lm_eval(
                        base_url=model_endpoint,
                        model_name=model_name,
                        task=task,
                        task_manager=self.get_task_manager(),
                    )
                except Exception as e:
                    print(
                        f"Error occurred while running LM eval for benchmark {benchmark.name}: {e}"
                    )
                    benchmark_results[task] = {
                        "error": True,
                        "results": {},
                        "effective_sample_count": 0,
                    }
                else:
                    benchmark_results[task] = {
                        "error": False,
                        "results": get_task_metric_results(eval_results, task),
                        "effective_sample_count": get_effective_sample_count(
                            eval_results, task
                        ),
                    }

                num_tasks_evaluated += 1
                progress = round((num_tasks_evaluated / total_tasks) * 100)
                self.repository.update_evaluation(evaluation, progress=progress)
                self.repository.save_evaluation(evaluation)
                self.broadcast_update(evaluation)

            status, aggregate_data = aggregate_results(benchmark_results)
            self.repository.update_benchmark(
                benchmark,
                status=status,
                n_samples=aggregate_data["total_effective_sample_count"],
                metrics=build_benchmark_metrics(aggregate_data["results"]),
            )
            self.repository.save_evaluation(evaluation)
            self.broadcast_update(evaluation)

        final_status = self._get_final_status(evaluation.benchmarks)
        self._complete_evaluation(evaluation, final_status)
        self.repository.save_evaluation(evaluation)
        self.broadcast_update(evaluation)

        return evaluation

    def _complete_evaluation(
        self, evaluation: EvaluationModel, status: EvaluationStatus
    ) -> None:
        completed_at = utc_now()
        started_at = self._to_aware_utc(evaluation.metadata_entry.started_at)
        duration = (completed_at - started_at).total_seconds()

        self.repository.update_evaluation_metadata(
            evaluation.metadata_entry, completed_at=completed_at, duration=duration
        )
        self.repository.update_evaluation(evaluation, status=status, progress=100.0)

    def _to_aware_utc(self, value: datetime) -> datetime:
        if value.tzinfo is None:
            return value.replace(tzinfo=UTC)

        return value.astimezone(UTC)

    def _get_final_status(self, benchmarks: list[BenchmarkModel]) -> EvaluationStatus:
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

    def get_subtasks(self, groups: list[str]) -> list[str]:
        subtasks = []
        for group_name in groups:
            subtasks.extend(get_group_tasks(group_name, self.get_task_manager()))
        return subtasks

    def broadcast_update(self, evaluation: EvaluationModel) -> None:
        try:
            publish_evaluation_update(evaluation)
        except Exception as e:
            print(f"Failed to broadcast evaluation update: {e}")
