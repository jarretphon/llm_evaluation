import uuid
from datetime import datetime

from app.domains.evaluations.schemas import EvaluationRead
from pydantic import BaseModel


class LLMBase(BaseModel):
    endpoint: str
    description: str
    provider: str


class LLMCreate(LLMBase):
    pass


class LLMRead(LLMBase):
    id: uuid.UUID
    added_at: datetime
    evaluations: list[EvaluationRead]


class LLMUpdate(BaseModel):
    endpoint: str | None = None
    description: str | None = None
    provider: str | None = None
