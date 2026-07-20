import uuid

import pytest
from app.domains.evaluations.errors import (
    EvaluationNotFoundError,
    NoBenchmarksSelectedError,
)
from app.domains.evaluations.schemas import EvaluationCreate
from app.domains.evaluations.service import EvaluationService


class FakeEvaluationRepository:
    def __init__(self) -> None:
        self.created_evaluations = []

    def get_by_id(self, evaluation_id: uuid.UUID):
        return None

    def create_evaluation(self, evaluation):
        self.created_evaluations.append(evaluation)
        return evaluation


def test_create_evaluation_raises_when_no_benchmarks_are_selected() -> None:
    repository = FakeEvaluationRepository()
    service = EvaluationService(repository)
    evaluation_create = EvaluationCreate(
        model_id=uuid.uuid4(),
        model_endpoint="http://localhost:8001/v1",
        model_name="test-model",
        benchmarks=[],
    )

    with pytest.raises(NoBenchmarksSelectedError):
        service.create_evaluation(evaluation_create)

    assert repository.created_evaluations == []


def test_get_evaluation_raises_when_missing() -> None:
    service = EvaluationService(FakeEvaluationRepository())
    evaluation_id = uuid.uuid4()

    with pytest.raises(EvaluationNotFoundError) as exc_info:
        service.get_evaluation(evaluation_id)

    assert exc_info.value.evaluation_id == evaluation_id
