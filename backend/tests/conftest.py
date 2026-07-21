import os
from collections.abc import Callable, Iterator
from datetime import datetime

import app.db.base  # noqa: F401
import pytest
from app.core.config import settings
from app.domains.evaluations.models import EvaluationModel, EvaluationStatus
from app.domains.llms.models import LLMModel
from sqlmodel import Session, SQLModel, create_engine
from tests.seeds.evaluations import (
    make_lm_eval_result as build_lm_eval_result,
    seed_evaluation as create_seed_evaluation,
    seed_evaluation_with_metrics as create_seed_evaluation_with_metrics,
)
from tests.seeds.llms import seed_llm as create_seed_llm

POSTGRES_URL_PREFIXES = ("postgresql://", "postgresql+psycopg2://")


@pytest.fixture(scope="session")
def test_database_url() -> str:
    database_url = os.getenv("TEST_DATABASE_URL", settings.test_database_url)

    if not database_url:
        pytest.fail(
            "TEST_DATABASE_URL or settings.test_database_url must be set for integration tests",
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
def seed_llm(db_session: Session) -> Callable[..., LLMModel]:
    def _seed_llm(**kwargs) -> LLMModel:
        return create_seed_llm(db_session, **kwargs)

    return _seed_llm


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
        benchmarks=None,
        started_at: datetime | None = None,
        completed_at: datetime | None = None,
        duration: float = 0.0,
    ) -> EvaluationModel:
        return create_seed_evaluation(
            db_session,
            llm=llm or seed_llm(),
            status=status,
            progress=progress,
            benchmarks=benchmarks,
            started_at=started_at,
            completed_at=completed_at,
            duration=duration,
        )

    return _seed_evaluation


@pytest.fixture
def seed_evaluation_with_metrics(
    db_session: Session,
) -> Callable[..., EvaluationModel]:
    def _seed_evaluation_with_metrics(**kwargs) -> EvaluationModel:
        return create_seed_evaluation_with_metrics(db_session, **kwargs)

    return _seed_evaluation_with_metrics


@pytest.fixture
def seed_completed_evaluation(
    seed_evaluation_with_metrics: Callable[..., EvaluationModel],
) -> Callable[..., EvaluationModel]:
    return seed_evaluation_with_metrics


@pytest.fixture
def make_lm_eval_result() -> Callable[..., dict]:
    return build_lm_eval_result
