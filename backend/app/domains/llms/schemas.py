import uuid
from datetime import datetime

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


class LLMUpdate(BaseModel):
    endpoint: str | None = None
    description: str | None = None
    provider: str | None = None
