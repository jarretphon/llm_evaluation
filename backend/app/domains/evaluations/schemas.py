import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class BenchmarkBase(BaseModel):
    name: str
    description: str


class BenchmarkCreate(BenchmarkBase):
    pass


class BenchmarkRead(BenchmarkBase):
    id: uuid.UUID
    status: str
    progress: float | None = None
    score: float | None = None


class EvaluationMetadata(BaseModel):
    started_at: datetime
    duration: float
    evaluation_status: str
    completed_at: datetime | None = None
    estimated_end_time: datetime | None = None
    progress: float | None = None

class EvaluationBase(BaseModel):
    benchmarks: list[BenchmarkCreate]


class EvaluationCreate(EvaluationBase):
    model_endpoint: str
    model_name: str = "default"
    benchmarks: list[BenchmarkCreate]


class EvaluationRead(EvaluationBase):
    id: uuid.UUID
    metadata_entry: EvaluationMetadata
    benchmarks: list[BenchmarkRead]
