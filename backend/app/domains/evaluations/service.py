import uuid
from datetime import UTC, datetime
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
    MetricModel,
    utc_now,
)
from app.domains.evaluations.notifications import publish_evaluation_update
from app.domains.evaluations.repository import EvaluationRepository
from app.domains.evaluations.schemas import EvaluationCreate
from app.domains.evaluations.traversal import get_root_groups
from app.domains.evaluations.utils import get_group_tasks, require_completions
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
                    eval_results = self._run_lm_eval(
                        base_url=model_endpoint,
                        model_name=model_name,
                        task=task,
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
                        "results": self._get_task_metric_results(eval_results, task),
                        "effective_sample_count": self._get_effective_sample_count(
                            eval_results, task
                        ),
                    }

                num_tasks_evaluated += 1
                progress = round((num_tasks_evaluated / total_tasks) * 100)
                self.repository.update_evaluation(evaluation, progress=progress)
                self.repository.save_evaluation(evaluation)
                self.broadcast_update(evaluation)

            status, aggregate_results = self.aggregate_results(benchmark_results)
            self.repository.update_benchmark(
                benchmark,
                status=status,
                n_samples=aggregate_results["total_effective_sample_count"],
                metrics=self._build_benchmark_metrics(aggregate_results["results"]),
            )
            self.repository.save_evaluation(evaluation)
            self.broadcast_update(evaluation)

        final_status = self._get_final_status(evaluation.benchmarks)
        self._complete_evaluation(evaluation, final_status)
        self.repository.save_evaluation(evaluation)
        self.broadcast_update(evaluation)

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

    def aggregate_results(
        self, results: dict[str, dict]
    ) -> tuple[EvaluationStatus, dict]:
        any_failed = any(result["error"] for result in results.values())
        all_failed = all(result["error"] for result in results.values())

        if all_failed:
            status = EvaluationStatus.FAILED
        elif any_failed:
            status = EvaluationStatus.PARTIAL_FAILED
        else:
            status = EvaluationStatus.COMPLETED

        aggregate_results = {
            "total_effective_sample_count": 0,
            "results": {},
        }

        # Get weighted average for each metric across all tasks, weighted by effective sample count
        # Weighted average = sum(value * weight) / sum(weight)
        for task_result in results.values():
            if task_result["error"]:
                continue

            sample_count = task_result.get("effective_sample_count", 0)
            aggregate_results["total_effective_sample_count"] += sample_count

            if sample_count <= 0:
                continue

            for metric_name, metric_value in task_result["results"].items():
                aggregate_results["results"][metric_name] = (
                    aggregate_results["results"].get(metric_name, 0.0)
                    + metric_value * sample_count
                )

        total_count = aggregate_results["total_effective_sample_count"]
        for metric_name, metric_value in aggregate_results["results"].items():
            aggregate_results["results"][metric_name] = round(
                metric_value / total_count, 5
            )

        return status, aggregate_results

    def _build_benchmark_metrics(
        self, aggregate_results: dict[str, float]
    ) -> list[MetricModel]:
        metrics = []

        for metric_name, metric_value in aggregate_results.items():
            if metric_value is None:
                continue

            metrics.append(
                MetricModel(
                    name=metric_name,
                    value=metric_value,
                )
            )

        return metrics

    def _get_task_metric_results(self, eval_results: dict, task: str) -> dict:
        task_results = eval_results.get("results", {})
        results = task_results.get(task)

        if results is None and len(task_results) == 1:
            results = next(iter(task_results.values()))

        if not isinstance(results, dict):
            return {}

        task_metrics = {}
        for metric_name in self._get_metric_names(eval_results, task):
            value = self._get_metric_value(results, metric_name)
            if value is None:
                continue

            task_metrics[metric_name] = value

        return task_metrics

    def _get_metric_names(self, eval_results: dict, task: str) -> list[str]:
        config = eval_results.get("configs", {}).get(task)

        if config is None and len(eval_results.get("configs", {})) == 1:
            config = next(iter(eval_results["configs"].values()))

        metric_list = config.get("metric_list", []) if isinstance(config, dict) else []
        metric_names = []

        for metric_entry in metric_list:
            if not isinstance(metric_entry, dict):
                continue

            metric_name = metric_entry.get("metric")
            if isinstance(metric_name, str):
                metric_names.append(metric_name)

        return metric_names

    def _get_metric_value(self, results: dict, metric_name: str) -> float | None:
        value = self._get_first_existing_value(
            results,
            [
                metric_name,
                f"{metric_name},none",
            ],
        )

        if value is not None:
            return value

        for result_key, result_value in results.items():
            result_metric_name, is_stderr = self._parse_result_metric_key(result_key)
            if result_metric_name == metric_name and not is_stderr:
                return result_value

        return None

    def _parse_result_metric_key(self, metric_key: str) -> tuple[str, bool]:
        metric_name, _, suffix = metric_key.partition(",")

        if suffix == "stderr":
            return metric_name, True

        if metric_name.endswith("_stderr"):
            return metric_name.removesuffix("_stderr"), True

        return metric_name, False

    def _get_first_existing_value(self, values: dict, keys: list[str]):
        for key in keys:
            if key in values:
                return values[key]

        return None

    def _get_effective_sample_count(self, eval_results: dict, task: str) -> int:
        task_samples = eval_results.get("n-samples", {})
        sample_entry = task_samples.get(task)

        if sample_entry is None and len(task_samples) == 1:
            sample_entry = next(iter(task_samples.values()))

        if not isinstance(sample_entry, dict):
            return 0

        return sample_entry.get("effective")

    def broadcast_update(self, evaluation: EvaluationModel) -> None:
        try:
            publish_evaluation_update(evaluation)
        except Exception as e:
            print(f"Failed to broadcast evaluation update: {e}")
