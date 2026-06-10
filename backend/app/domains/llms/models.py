import uuid
from datetime import UTC, datetime

from sqlmodel import Field, Relationship, SQLModel


class LLMModel(SQLModel, table=True):
    __tablename__ = "llms"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    endpoint: str = Field(unique=True)
    description: str
    provider: str
    added_at: datetime = Field(default_factory=lambda: datetime.now(UTC))

    # Suppress undefined reference warning from pylance and ruff due to forward reference type checking
    # Operation is safe as the relationship is defined in the related model and SQLModel handles the relationship resolution at runtime
    evaluations: list["EvaluationModel"] = Relationship(  # type: ignore # noqa: F821
        back_populates="llm_entry", cascade_delete=True
    )
