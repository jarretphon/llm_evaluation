from collections.abc import Iterator

from app.api.comparisons import router as comparisons_router
from app.db.session import get_session
from app.domains.comparisons.repository import ComparisonRepository
from app.domains.llms.models import LLMModel
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlmodel import Session
from tests.seeds.comparisons import seed_comparison_data as create_comparison_seed_data

import pytest


@pytest.fixture
def comparison_repository(db_session: Session) -> ComparisonRepository:
    return ComparisonRepository(db_session)


@pytest.fixture
def api_client(db_session: Session) -> Iterator[TestClient]:
    app = FastAPI()
    app.include_router(comparisons_router, prefix="/comparisons")

    def override_get_session() -> Iterator[Session]:
        yield db_session

    app.dependency_overrides[get_session] = override_get_session

    with TestClient(app) as client:
        yield client


@pytest.fixture
def comparison_seed_data(db_session: Session) -> tuple[LLMModel, LLMModel]:
    return create_comparison_seed_data(db_session)
