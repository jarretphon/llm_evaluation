import os
from collections.abc import Iterator

import app.db.base  # noqa: F401
import pytest
from app.core.config import settings
from sqlmodel import Session, SQLModel, create_engine

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
