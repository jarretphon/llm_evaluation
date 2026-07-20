import uuid
from collections.abc import Callable, Iterator
from datetime import UTC, datetime

import app.api.evaluations as evaluations_api
import pytest
from app.api.evaluations import router as evaluations_router
from app.db.session import get_session
from app.domains.evaluations.models import (
    BenchmarkModel,
    EvaluationMetadata,
    EvaluationModel,
    EvaluationStatus,
    MetricModel,
)
from app.domains.evaluations.repository import EvaluationRepository
from app.domains.llms.models import LLMModel
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlmodel import Session


@pytest.fixture
def task_queue(mocker):
    return mocker.patch.object(evaluations_api.run_evaluation_task, "delay")


@pytest.fixture
def evaluation_repository(db_session: Session) -> EvaluationRepository:
    return EvaluationRepository(db_session)


@pytest.fixture
def api_client(
    db_session: Session,
    task_queue,
) -> Iterator[TestClient]:
    app = FastAPI()
    app.include_router(evaluations_router, prefix="/evaluations")

    def override_get_session() -> Iterator[Session]:
        yield db_session

    app.dependency_overrides[get_session] = override_get_session

    with TestClient(app) as client:
        yield client


@pytest.fixture
def seed_llm(db_session: Session) -> Callable[..., LLMModel]:
    def _seed_llm(
        *,
        name: str | None = None,
        endpoint: str = "http://localhost:8001/v1",
        description: str = "A seeded model for evaluation tests",
        provider: str = "OpenAI",
        api_key: str = "seed-api-key",
    ) -> LLMModel:
        llm = LLMModel(
            id=uuid.uuid4(),
            name=name or f"Evaluation Test Model {uuid.uuid4()}",
            endpoint=endpoint,
            description=description,
            provider=provider,
            api_key=api_key,
        )
        db_session.add(llm)
        db_session.commit()
        db_session.refresh(llm)
        return llm

    return _seed_llm


@pytest.fixture
def make_evaluation_payload() -> Callable[..., dict]:
    def _make_evaluation_payload(
        *,
        model_id: uuid.UUID,
        model_endpoint: str = "http://localhost:8001/v1",
        model_name: str = "test-model",
        benchmarks: list[str] | None = None,
    ) -> dict:
        return {
            "model_id": str(model_id),
            "model_endpoint": model_endpoint,
            "model_name": model_name,
            "benchmarks": benchmarks if benchmarks is not None else ["mmlu", "gsm8k"],
        }

    return _make_evaluation_payload


@pytest.fixture
def seed_evaluation(
    db_session: Session,
    seed_llm: Callable[..., LLMModel],
) -> Callable[..., EvaluationModel]:
    def _seed_evaluation(
        *,
        llm: LLMModel | None = None,
        status: EvaluationStatus = EvaluationStatus.QUEUED,
        progress: float = 0.0,
        benchmarks: list[BenchmarkModel] | None = None,
        started_at: datetime | None = None,
    ) -> EvaluationModel:
        llm = llm or seed_llm()
        evaluation = EvaluationModel(
            id=uuid.uuid4(),
            llm_id=llm.id,
            status=status,
            progress=progress,
            metadata_entry=EvaluationMetadata(
                started_at=started_at or datetime.now(UTC)
            ),
            benchmarks=benchmarks
            if benchmarks is not None
            else [
                BenchmarkModel(
                    name="mmlu",
                    status=EvaluationStatus.COMPLETED,
                    n_samples=20,
                    metrics=[MetricModel(name="acc", value=0.8)],
                )
            ],
        )
        db_session.add(evaluation)
        db_session.commit()
        db_session.refresh(evaluation)
        return evaluation

    return _seed_evaluation
