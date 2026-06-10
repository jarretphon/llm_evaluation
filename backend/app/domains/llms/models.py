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
    evaluations: list["Evaluation"] = Relationship(
        back_populates="llm_entry", cascade_delete=True
    )


class Evaluation(SQLModel, table=True):
    __tablename__ = "evaluations"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    llm_id: uuid.UUID = Field(foreign_key="llms.id", ondelete="CASCADE")
    llm_entry: "LLMModel" = Relationship(back_populates="evaluations")
