from collections.abc import Callable, Iterator
from datetime import UTC, datetime, timedelta

import pytest
from app.api.llms import router as llms_router
from app.db.session import get_session
from app.domains.llms.models import LLMModel
from app.domains.llms.repository import LLMRepository
from app.domains.llms.schemas import LLMCreate, LLMUpdate
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlmodel import Session


@pytest.fixture
def llm_repository(db_session: Session) -> LLMRepository:
    return LLMRepository(db_session)


@pytest.fixture
def make_llm_create() -> Callable[..., LLMCreate]:
    def _make_llm_create(
        *,
        name: str = "Test Model",
        endpoint: str = "http://localhost:8001/v1",
        description: str = "A test model",
        provider: str = "OpenAI",
        api_key: str = "test-api-key",
    ) -> LLMCreate:
        return LLMCreate(
            name=name,
            endpoint=endpoint,
            description=description,
            provider=provider,
            api_key=api_key,
        )

    return _make_llm_create


@pytest.fixture
def make_llm_update() -> Callable[..., LLMUpdate]:
    def _make_llm_update(**changes) -> LLMUpdate:
        return LLMUpdate(**changes)

    return _make_llm_update


@pytest.fixture
def make_llm_payload() -> Callable[..., dict[str, str]]:
    def _make_llm_payload(
        *,
        name: str = "Test Model",
        endpoint: str = "http://localhost:8001/v1",
        description: str = "A test model",
        provider: str = "OpenAI",
        api_key: str = "test-api-key",
    ) -> dict[str, str]:
        return {
            "name": name,
            "endpoint": endpoint,
            "description": description,
            "provider": provider,
            "api_key": api_key,
        }

    return _make_llm_payload


@pytest.fixture
def seed_ordered_llms(seed_llm: Callable[..., LLMModel]) -> list[LLMModel]:
    now = datetime.now(UTC)
    return [
        seed_llm(name="Newest Model", added_at=now),
        seed_llm(name="Middle Model", added_at=now - timedelta(minutes=1)),
        seed_llm(name="Oldest Model", added_at=now - timedelta(minutes=2)),
    ]


@pytest.fixture
def api_client(db_session: Session) -> Iterator[TestClient]:
    app = FastAPI()
    app.include_router(llms_router, prefix="/llms")

    def override_get_session() -> Iterator[Session]:
        yield db_session

    app.dependency_overrides[get_session] = override_get_session

    with TestClient(app) as client:
        yield client
