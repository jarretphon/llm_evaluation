import uuid
from types import SimpleNamespace

import pytest
from app.domains.comparisons.errors import ComparisonModelNotFoundError
from app.domains.comparisons.schemas import ComparisonRequest
from app.domains.comparisons.service import ComparisonService


class FakeComparisonRepository:
    def __init__(self, *, model_ids: list[uuid.UUID], metric_rows=None) -> None:
        self.models = [SimpleNamespace(id=model_id) for model_id in model_ids]
        self.metric_rows = metric_rows or []
        self.model_lookup_calls = []
        self.metric_lookup_calls = []

    def get_models_by_ids(self, model_ids: list[uuid.UUID]):
        self.model_lookup_calls.append(model_ids)
        requested_model_ids = set(model_ids)
        return [model for model in self.models if model.id in requested_model_ids]

    def get_latest_evaluation_metrics(self, model_ids: list[uuid.UUID]):
        self.metric_lookup_calls.append(model_ids)
        return self.metric_rows


def test_compare_models_dedupes_model_ids_before_querying_repository() -> None:
    first_model_id = uuid.uuid4()
    second_model_id = uuid.uuid4()
    repository = FakeComparisonRepository(
        model_ids=[first_model_id, second_model_id],
    )
    service = ComparisonService(repository)

    service.compare_models(
        ComparisonRequest(
            model_ids=[first_model_id, second_model_id, first_model_id],
        )
    )

    assert repository.model_lookup_calls == [[first_model_id, second_model_id]]
    assert repository.metric_lookup_calls == [[first_model_id, second_model_id]]


def test_compare_models_raises_when_requested_model_is_missing() -> None:
    existing_model_id = uuid.uuid4()
    missing_model_id = uuid.uuid4()
    repository = FakeComparisonRepository(model_ids=[existing_model_id])
    service = ComparisonService(repository)

    with pytest.raises(ComparisonModelNotFoundError) as exc_info:
        service.compare_models(
            ComparisonRequest(model_ids=[existing_model_id, missing_model_id])
        )

    assert exc_info.value.model_id == missing_model_id
    assert repository.metric_lookup_calls == []


def test_compare_models_returns_empty_payload_for_empty_model_ids() -> None:
    repository = FakeComparisonRepository(model_ids=[])
    service = ComparisonService(repository)

    comparison = service.compare_models(ComparisonRequest(model_ids=[]))

    assert comparison.root == {}
    assert repository.model_lookup_calls == [[]]
    assert repository.metric_lookup_calls == [[]]
