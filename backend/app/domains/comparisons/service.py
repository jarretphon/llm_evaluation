import math
import uuid
from collections import OrderedDict
from typing import Any

from app.domains.comparisons.errors import ComparisonModelNotFoundError
from app.domains.comparisons.repository import ComparisonRepository
from app.domains.comparisons.schemas import (
    ComparisonBenchmarkRead,
    ComparisonModelRead,
    ComparisonRead,
    ComparisonRequest,
    ComparisonValueRead,
)
from app.domains.evaluations.models import BenchmarkModel, EvaluationModel
from app.domains.llms.models import LLMModel


class ComparisonService:
    def __init__(self, repository: ComparisonRepository) -> None:
        self.repository = repository

    def compare_models(self, comparison_request: ComparisonRequest) -> ComparisonRead:
        model_ids = self._dedupe_model_ids(comparison_request.model_ids)
        models = self._get_models_in_request_order(model_ids)
        latest_evaluations = self._get_latest_completed_evaluations(model_ids)
        benchmark_names = self._get_benchmark_names(models, latest_evaluations)

        comparison_models = [
            ComparisonModelRead(
                id=model.id,
                name=model.name,
                provider=model.provider,
                latest_evaluation_id=(
                    latest_evaluations[model.id].id
                    if model.id in latest_evaluations
                    else None
                ),
            )
            for model in models
        ]
        comparison_benchmarks = [
            self._build_benchmark_comparison(
                benchmark_name=benchmark_name,
                models=models,
                latest_evaluations=latest_evaluations,
            )
            for benchmark_name in benchmark_names
        ]

        return ComparisonRead(
            models=comparison_models,
            benchmarks=comparison_benchmarks,
        )

    def _dedupe_model_ids(self, model_ids: list[uuid.UUID]) -> list[uuid.UUID]:
        return list(OrderedDict.fromkeys(model_ids))

    def _get_models_in_request_order(self, model_ids: list[uuid.UUID]) -> list[LLMModel]:
        models = self.repository.get_models_by_ids(model_ids)
        models_by_id = {model.id: model for model in models}

        for model_id in model_ids:
            if model_id not in models_by_id:
                raise ComparisonModelNotFoundError(model_id)

        return [models_by_id[model_id] for model_id in model_ids]

    def _get_latest_completed_evaluations(
        self, model_ids: list[uuid.UUID]
    ) -> dict[uuid.UUID, EvaluationModel]:
        latest_evaluations: dict[uuid.UUID, EvaluationModel] = {}
        evaluations = self.repository.list_completed_evaluations_for_models(model_ids)

        for evaluation in evaluations:
            latest_evaluations.setdefault(evaluation.llm_id, evaluation)

        return latest_evaluations

    def _get_benchmark_names(
        self,
        models: list[LLMModel],
        latest_evaluations: dict[uuid.UUID, EvaluationModel],
    ) -> list[str]:
        benchmark_names: OrderedDict[str, None] = OrderedDict()

        for model in models:
            evaluation = latest_evaluations.get(model.id)
            if evaluation is None:
                continue

            for benchmark in evaluation.benchmarks:
                benchmark_names.setdefault(benchmark.name, None)

        return list(benchmark_names)

    def _build_benchmark_comparison(
        self,
        benchmark_name: str,
        models: list[LLMModel],
        latest_evaluations: dict[uuid.UUID, EvaluationModel],
    ) -> ComparisonBenchmarkRead:
        benchmarks_by_model_id = {
            model.id: self._find_benchmark(
                latest_evaluations.get(model.id), benchmark_name
            )
            for model in models
        }
        metrics = self._get_metric_names(models, benchmarks_by_model_id)
        values = [
            ComparisonValueRead(
                model_id=model.id,
                metric=metric,
                value=self._get_metric_value(
                    benchmarks_by_model_id.get(model.id), metric
                ),
            )
            for metric in metrics
            for model in models
        ]

        return ComparisonBenchmarkRead(
            name=benchmark_name,
            metrics=metrics,
            values=values,
        )

    def _find_benchmark(
        self, evaluation: EvaluationModel | None, benchmark_name: str
    ) -> BenchmarkModel | None:
        if evaluation is None:
            return None

        return next(
            (
                benchmark
                for benchmark in evaluation.benchmarks
                if benchmark.name == benchmark_name
            ),
            None,
        )

    def _get_metric_names(
        self,
        models: list[LLMModel],
        benchmarks_by_model_id: dict[uuid.UUID, BenchmarkModel | None],
    ) -> list[str]:
        metrics: OrderedDict[str, None] = OrderedDict()

        for model in models:
            benchmark = benchmarks_by_model_id.get(model.id)
            if benchmark is None:
                continue

            for metric, value in benchmark.results.items():
                if self._is_chart_metric(metric, value):
                    metrics.setdefault(metric, None)

        return list(metrics)

    def _get_metric_value(
        self, benchmark: BenchmarkModel | None, metric: str
    ) -> float | None:
        if benchmark is None:
            return None

        return self._to_number(benchmark.results.get(metric))

    def _is_chart_metric(self, metric: str, value: Any) -> bool:
        return "stderr" not in metric.lower() and self._to_number(value) is not None

    def _to_number(self, value: Any) -> float | None:
        if value is None or isinstance(value, bool):
            return None

        if isinstance(value, int | float):
            number = float(value)
            return number if math.isfinite(number) else None

        if isinstance(value, str):
            try:
                number = float(value)
            except ValueError:
                return None

            return number if math.isfinite(number) else None

        return None
