import uuid
from collections.abc import Callable, Iterator

import app.api.evaluations as evaluations_api
import pytest
from app.api.evaluations import router as evaluations_router
from app.db.session import get_session
from app.domains.evaluations.repository import EvaluationRepository
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
