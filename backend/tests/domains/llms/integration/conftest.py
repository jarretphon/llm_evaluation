import os
import uuid
from collections.abc import Callable, Iterator
from datetime import UTC, datetime, timedelta

import app.db.base  # noqa: F401
import pytest
from app.api.llms import router as llms_router
from app.core.config import settings
from app.db.session import get_session
from app.domains.llms.models import LLMModel
from app.domains.llms.repository import LLMRepository
from app.domains.llms.schemas import LLMCreate, LLMUpdate
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine

POSTGRES_URL_PREFIXES = ("postgresql://", "postgresql+psycopg2://")


@pytest.fixture(scope="session")
def test_database_url() -> str:
    database_url = os.getenv("TEST_DATABASE_URL", settings.test_database_url)

    if not database_url:
        pytest.fail(
            "TEST_DATABASE_URL or settings.test_database_url must be set for LLM integration tests",
            pytrace=False,
        )

    if database_url == settings.database_url:
        pytest.fail(
            "TEST_DATABASE_URL must not be the same as DATABASE_URL",
            pytrace=False,
        )

    if not database_url.startswith(POSTGRES_URL_PREFIXES):
        pytest.fail(
            "TEST_DATABASE_URL must point to a Postgres database",
            pytrace=False,
        )

    return database_url


@pytest.fixture(scope="session")
def test_engine(test_database_url: str):
    engine = create_engine(test_database_url)
    yield engine
    engine.dispose()


@pytest.fixture
def db_session(test_engine) -> Iterator[Session]:
    SQLModel.metadata.drop_all(test_engine)
    SQLModel.metadata.create_all(test_engine)

    with Session(test_engine) as session:
        try:
            yield session
        finally:
            session.rollback()

    SQLModel.metadata.drop_all(test_engine)


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
def seed_llm(db_session: Session) -> Callable[..., LLMModel]:
    def _seed_llm(
        *,
        name: str = "Seed Model",
        endpoint: str = "http://localhost:8001/v1",
        description: str = "A seeded model",
        provider: str = "OpenAI",
        api_key: str = "seed-api-key",
        added_at: datetime | None = None,
    ) -> LLMModel:
        llm = LLMModel(
            id=uuid.uuid4(),
            name=name,
            endpoint=endpoint,
            description=description,
            provider=provider,
            api_key=api_key,
            added_at=added_at or datetime.now(UTC),
        )
        db_session.add(llm)
        db_session.commit()
        db_session.refresh(llm)
        return llm

    return _seed_llm


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
