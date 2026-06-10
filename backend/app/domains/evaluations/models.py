import uuid
from datetime import UTC, datetime
from enum import StrEnum
from typing import Optional

from sqlmodel import Field, Relationship, SQLModel


class EvaluationStatus(StrEnum):
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    QUEUED = "queued"


class EvaluationModel(SQLModel, table=True):
    __tablename__ = "evaluations"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    llm_id: uuid.UUID = Field(foreign_key="llms.id", ondelete="CASCADE")
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
    started_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    duration: float
    completed_at: Optional[datetime] = Field(default=None)
    estimated_end_time: Optional[datetime] = Field(default=None)
    progress: Optional[float] = Field(default=None)
    evaluation_status: EvaluationStatus

    evaluation_entry: "EvaluationModel" = Relationship(back_populates="metadata_entry")


class BenchmarkModel(SQLModel, table=True):
    __tablename__ = "benchmarks"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    evaluation_id: uuid.UUID = Field(foreign_key="evaluations.id", ondelete="CASCADE")
    name: str
    description: str
    status: EvaluationStatus = Field(default=EvaluationStatus.QUEUED)
    progress: Optional[float] = Field(default=None)
    score: Optional[float] = Field(default=None)

    evaluation_entry: "EvaluationModel" = Relationship(back_populates="benchmarks")
