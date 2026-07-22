import uuid
from datetime import UTC, datetime

from app.domains.evaluations.models import EvaluationModel
from app.domains.llms.models import LLMModel
from sqlmodel import Session


def seed_llm(
    session: Session,
    *,
    name: str | None = None,
    endpoint: str = "http://localhost:8001/v1",
    description: str = "A seeded model",
    provider: str = "OpenAI",
    api_key: str = "seed-api-key",
    added_at: datetime | None = None,
    evaluations: list[EvaluationModel] | None = None,
) -> LLMModel:
    llm = LLMModel(
        id=uuid.uuid4(),
        name=name or f"Test Model {uuid.uuid4()}",
        endpoint=endpoint,
        description=description,
        provider=provider,
        api_key=api_key,
        added_at=added_at or datetime.now(UTC),
    )
    for evaluation in evaluations or []:
        evaluation.llm_id = llm.id
    llm.evaluations = evaluations or []
    session.add(llm)
    session.commit()
    session.refresh(llm)
    return llm
