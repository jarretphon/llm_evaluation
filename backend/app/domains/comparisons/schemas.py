import uuid

from pydantic import BaseModel, Field, RootModel

ModelName, BenchmarkName, MetricName = str, str, str
MetricRow = tuple[uuid.UUID, ModelName, BenchmarkName, MetricName, float]


class ModelMetricResults(BaseModel):
    model_id: uuid.UUID
    model_name: str
    value: float | None


BenchmarkMetrics = dict[MetricName, list[ModelMetricResults]]
ComparisonBenchmarks = dict[BenchmarkName, BenchmarkMetrics]


class ComparisonRequest(BaseModel):
    model_ids: list[uuid.UUID] = Field(default_factory=list)


class ComparisonRead(RootModel[ComparisonBenchmarks]):
    pass
