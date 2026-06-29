import uuid
from collections import OrderedDict

from app.domains.comparisons.errors import ComparisonModelNotFoundError
from app.domains.comparisons.repository import ComparisonMetricRow, ComparisonRepository
from app.domains.comparisons.schemas import (
    ComparisonBenchmarkRead,
    ComparisonModelRead,
    ComparisonRead,
    ComparisonRequest,
    ComparisonValueRead,
)


class ComparisonService:
    def __init__(self, repository: ComparisonRepository) -> None:
        self.repository = repository

    def compare_models(self, comparison_request: ComparisonRequest) -> ComparisonRead:
        model_ids = self._dedupe_model_ids(comparison_request.model_ids)
        self._validate_models_exist(model_ids)
        metric_rows = self.repository.list_latest_evaluation_metric_rows(model_ids)

        return ComparisonRead(
            models=self._build_comparison_models(metric_rows),
            benchmarks=self._build_comparison_benchmarks(metric_rows),
        )

    def _dedupe_model_ids(self, model_ids: list[uuid.UUID]) -> list[uuid.UUID]:
        return list(OrderedDict.fromkeys(model_ids))

    def _validate_models_exist(self, model_ids: list[uuid.UUID]) -> None:
        models = self.repository.get_models_by_ids(model_ids)
        models_by_id = {model.id: model for model in models}

        for model_id in model_ids:
            if model_id not in models_by_id:
                raise ComparisonModelNotFoundError(model_id)

    def _build_comparison_models(
        self, metric_rows: list[ComparisonMetricRow]
    ) -> list[ComparisonModelRead]:
        models_by_id: OrderedDict[uuid.UUID, ComparisonModelRead] = OrderedDict()

        for row in metric_rows:
            models_by_id.setdefault(
                row.model_id,
                ComparisonModelRead(
                    id=row.model_id,
                    name=row.model_name,
                    latest_evaluation_id=row.evaluation_id,
                ),
            )

        return list(models_by_id.values())

    def _build_comparison_benchmarks(
        self, metric_rows: list[ComparisonMetricRow]
    ) -> list[ComparisonBenchmarkRead]:
        benchmark_metrics: OrderedDict[str, OrderedDict[str, None]] = OrderedDict()
        benchmark_values: OrderedDict[str, list[ComparisonValueRead]] = OrderedDict()

        for row in metric_rows:
            benchmark_metrics.setdefault(row.benchmark_name, OrderedDict()).setdefault(
                row.metric_name, None
            )
            benchmark_values.setdefault(row.benchmark_name, []).append(
                ComparisonValueRead(
                    model_id=row.model_id,
                    metric=row.metric_name,
                    value=row.value,
                )
            )

        return [
            ComparisonBenchmarkRead(
                name=benchmark_name,
                metrics=list(metrics),
                values=benchmark_values[benchmark_name],
            )
            for benchmark_name, metrics in benchmark_metrics.items()
        ]
