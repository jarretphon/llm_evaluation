import uuid
from datetime import UTC, datetime
from enum import StrEnum
from typing import Optional

from sqlalchemy import DateTime
from sqlmodel import Column, Field, Relationship, SQLModel


def utc_now() -> datetime:
    return datetime.now(UTC)


class EvaluationStatus(StrEnum):
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    PARTIAL_FAILED = "partial_failed"
    QUEUED = "queued"


class EvaluationModel(SQLModel, table=True):
    __tablename__ = "evaluations"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    llm_id: uuid.UUID = Field(foreign_key="llms.id", ondelete="CASCADE")
    status: EvaluationStatus = Field(default=EvaluationStatus.QUEUED)
    metadata_entry: "EvaluationMetadata" = Relationship(
        back_populates="evaluation_entry"
    )
    benchmarks: list["BenchmarkModel"] = Relationship(
        back_populates="evaluation_entry", cascade_delete=True
    )

    # Suppress undefined reference warning from pylance and ruff due to forward reference type checking
    # Operation is safe as the relationship is defined in the related model and SQLModel handles the relationship resolution at runtime
    llm_entry: "LLMModel" = Relationship(back_populates="evaluations")  # type: ignore # noqa: F821


class EvaluationMetadata(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, unique=True)
    evaluation_id: uuid.UUID = Field(foreign_key="evaluations.id")
    started_at: datetime = Field(
        default_factory=utc_now,
        sa_column=Column(DateTime(timezone=True), nullable=False),
    )
    duration: float = Field(default=0.0)
    completed_at: Optional[datetime] = Field(
        default=None,
        sa_column=Column(DateTime(timezone=True), nullable=True),
    )
    estimated_end_time: Optional[datetime] = Field(
        default=None,
        sa_column=Column(DateTime(timezone=True), nullable=True),
    )
    progress: float = Field(default=0.0)

    evaluation_entry: "EvaluationModel" = Relationship(back_populates="metadata_entry")


class BenchmarkModel(SQLModel, table=True):
    __tablename__ = "benchmarks"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    evaluation_id: uuid.UUID = Field(foreign_key="evaluations.id", ondelete="CASCADE")
    name: str
    description: str = Field(default="")
    status: EvaluationStatus = Field(default=EvaluationStatus.QUEUED)
    effective_sample_count: int = Field(default=0)
    metrics: list["MetricModel"] = Relationship(
        back_populates="benchmark_entry", cascade_delete=True
    )

    evaluation_entry: "EvaluationModel" = Relationship(back_populates="benchmarks")


class MetricModel(SQLModel, table=True):
    __tablename__ = "benchmark_metrics"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    benchmark_id: uuid.UUID = Field(foreign_key="benchmarks.id", ondelete="CASCADE")
    name: str
    value: float | None = Field(default=None)
    stderr: float | None = Field(default=None)

    benchmark_entry: "BenchmarkModel" = Relationship(back_populates="metrics")
