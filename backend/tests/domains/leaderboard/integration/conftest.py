from collections.abc import Iterator

import app.domains.leaderboard.service as leaderboard_service_module
import pytest
from app.api.leaderboard import router as leaderboard_router
from app.db.session import get_session
from app.domains.leaderboard.repository import LeaderboardRepository
from app.domains.leaderboard.service import LeaderboardService
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlmodel import Session

from tests.seeds.leaderboard import (
    LEADERBOARD_BENCHMARK_OPTIONS,
)
from tests.seeds.leaderboard import (
    seed_leaderboard_data as create_leaderboard_seed_data,
)


@pytest.fixture
def leaderboard_repository(db_session: Session) -> LeaderboardRepository:
    return LeaderboardRepository(db_session)


@pytest.fixture
def leaderboard_benchmark_options(mocker) -> dict[str, list[str]]:
    mocker.patch.object(LeaderboardService, "get_task_manager", return_value=object())
    mocker.patch.object(
        leaderboard_service_module,
        "get_root_groups",
        return_value=LEADERBOARD_BENCHMARK_OPTIONS,
    )
    return LEADERBOARD_BENCHMARK_OPTIONS


@pytest.fixture
def leaderboard_seed_data(db_session: Session):
    return create_leaderboard_seed_data(db_session)


@pytest.fixture
def api_client(
    db_session: Session,
    leaderboard_benchmark_options: dict[str, list[str]],
) -> Iterator[TestClient]:
    app = FastAPI()
    app.include_router(leaderboard_router, prefix="/leaderboard")

    def override_get_session() -> Iterator[Session]:
        yield db_session

    app.dependency_overrides[get_session] = override_get_session

    with TestClient(app) as client:
        yield client
