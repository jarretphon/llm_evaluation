import uuid
from collections import OrderedDict, defaultdict

from app.domains.comparisons.errors import ComparisonModelNotFoundError
from app.domains.comparisons.repository import ComparisonRepository
from app.domains.comparisons.schemas import (
    ComparisonRead,
    ComparisonRequest,
    MetricRow,
    ModelMetricResults,
)


class ComparisonService:
    def __init__(self, repository: ComparisonRepository) -> None:
        self.repository = repository

    def compare_models(self, comparison_request: ComparisonRequest) -> ComparisonRead:
        model_ids = self._dedupe_model_ids(comparison_request.model_ids)
        self._validate_models_exist(model_ids)
        metric_rows = self.repository.get_latest_evaluation_metrics(model_ids)

        return self._build_comparison_benchmarks(metric_rows)

    def _dedupe_model_ids(self, model_ids: list[uuid.UUID]) -> list[uuid.UUID]:
        return list(OrderedDict.fromkeys(model_ids))

    def _validate_models_exist(self, model_ids: list[uuid.UUID]) -> None:
        models = self.repository.get_models_by_ids(model_ids)
        models_by_id = {model.id: model for model in models}

        for model_id in model_ids:
            if model_id not in models_by_id:
                raise ComparisonModelNotFoundError(model_id)

    def _build_comparison_benchmarks(
        self, metric_rows: list[MetricRow]
    ) -> ComparisonRead:
        results = defaultdict(lambda: defaultdict(list))
        for model_id, model_name, benchmark_name, metric_name, value in metric_rows:
            results[benchmark_name][metric_name].append(
                ModelMetricResults(
                    model_id=model_id,
                    model_name=model_name,
                    value=value,
                )
            )

        return ComparisonRead.model_validate(results)
