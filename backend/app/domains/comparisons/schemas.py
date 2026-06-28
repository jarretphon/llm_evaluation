import uuid

from pydantic import BaseModel, Field


class ComparisonRequest(BaseModel):
    model_ids: list[uuid.UUID] = Field(default_factory=list)


class ComparisonModelRead(BaseModel):
    id: uuid.UUID
    name: str
    provider: str
    latest_evaluation_id: uuid.UUID | None = None


class ComparisonValueRead(BaseModel):
    model_id: uuid.UUID
    metric: str
    value: float | None = None


class ComparisonBenchmarkRead(BaseModel):
    name: str
    metrics: list[str]
    values: list[ComparisonValueRead]


class ComparisonRead(BaseModel):
    models: list[ComparisonModelRead]
    benchmarks: list[ComparisonBenchmarkRead]
