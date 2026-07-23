from collections.abc import Callable
from datetime import UTC, datetime, timedelta

import pytest
from app.domains.evaluations.models import EvaluationModel, EvaluationStatus
from app.domains.llms.models import LLMModel
from app.domains.llms.repository import LLMRepository
from app.domains.llms.schemas import LLMCreate, LLMUpdate
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session
from tests.seeds.evaluations import build_benchmark


def test_create_persists_llm_and_can_fetch_by_id_and_name(
    llm_repository: LLMRepository,
    make_llm_create: Callable[..., LLMCreate],
) -> None:
    llm_create = make_llm_create(name="Persisted Model")

    llm = llm_repository.create_llm(llm_create)

    llm_by_id = llm_repository.get_by_id(llm.id)
    llm_by_name = llm_repository.get_by_name(llm_create.name)
    assert llm_by_id == llm
    assert llm_by_name == llm
    assert llm.name == llm_create.name


def test_list_llms_returns_rows_with_pagination(
    llm_repository: LLMRepository,
    seed_ordered_llms: list[LLMModel],
) -> None:
    result = llm_repository.list_llms(offset=1, limit=1)

    assert result == [seed_ordered_llms[1]]


def test_get_model_summary_counts_reflects_current_database_state(
    llm_repository: LLMRepository,
    seed_llm: Callable[..., LLMModel],
    seed_evaluation: Callable[..., EvaluationModel],
) -> None:
    today = datetime.now(UTC)
    yesterday = today - timedelta(days=1)
    first_llm = seed_llm(name="First Summary Model", provider="OpenAI")
    second_llm = seed_llm(name="Second Summary Model", provider="Anthropic")
    seed_llm(name="Third Summary Model", provider="OpenAI")

    seed_evaluation(
        llm=first_llm,
        status=EvaluationStatus.RUNNING,
        benchmarks=[
            build_benchmark("running-one", status=EvaluationStatus.RUNNING),
            build_benchmark("running-two", status=EvaluationStatus.RUNNING),
            build_benchmark("queued-task", status=EvaluationStatus.QUEUED),
        ],
    )
    seed_evaluation(
        llm=first_llm,
        status=EvaluationStatus.COMPLETED,
        completed_at=today,
    )
    seed_evaluation(
        llm=first_llm,
        status=EvaluationStatus.COMPLETED,
        completed_at=yesterday,
    )
    seed_evaluation(llm=second_llm, status=EvaluationStatus.QUEUED)
    seed_evaluation(llm=second_llm, status=EvaluationStatus.FAILED)
    seed_evaluation(llm=second_llm, status=EvaluationStatus.PARTIAL_FAILED)

    result = llm_repository.get_model_summary_counts()

    assert result.total_models == 3
    assert result.provider_count == 2
    assert result.active_evaluations == 1
    assert result.running_benchmarks == 2
    assert result.completed_today == 1
    assert result.queued_evaluations == 1
    assert result.needs_attention == 2


def test_edit_llm_updates_only_provided_fields(
    llm_repository: LLMRepository,
    make_llm_create: Callable[..., LLMCreate],
    make_llm_update: Callable[..., LLMUpdate],
) -> None:
    llm = llm_repository.create_llm(
        make_llm_create(
            name="Editable Model",
            endpoint="http://localhost:8001/v1",
            description="Original description",
        )
    )
    llm_update = make_llm_update(description="Updated description")

    updated_llm = llm_repository.edit_llm(llm, llm_update)

    assert updated_llm.name == "Editable Model"
    assert updated_llm.endpoint == "http://localhost:8001/v1"
    assert updated_llm.description == "Updated description"


def test_delete_llm_removes_row(
    llm_repository: LLMRepository,
    make_llm_create: Callable[..., LLMCreate],
) -> None:
    llm = llm_repository.create_llm(make_llm_create(name="Deleted Model"))

    llm_repository.delete_llm(llm)

    assert llm_repository.get_by_id(llm.id) is None


def test_create_llm_raises_integrity_error_for_duplicate_name(
    db_session: Session,
    llm_repository: LLMRepository,
    make_llm_create: Callable[..., LLMCreate],
) -> None:
    llm_repository.create_llm(make_llm_create(name="Duplicate Model"))

    with pytest.raises(IntegrityError):
        llm_repository.create_llm(make_llm_create(name="Duplicate Model"))

    db_session.rollback()


def test_edit_llm_raises_integrity_error_for_duplicate_name(
    db_session: Session,
    llm_repository: LLMRepository,
    make_llm_create: Callable[..., LLMCreate],
    make_llm_update: Callable[..., LLMUpdate],
) -> None:
    first_llm = llm_repository.create_llm(make_llm_create(name="First Model"))
    second_llm = llm_repository.create_llm(make_llm_create(name="Second Model"))

    with pytest.raises(IntegrityError):
        llm_repository.edit_llm(second_llm, make_llm_update(name=first_llm.name))

    db_session.rollback()
