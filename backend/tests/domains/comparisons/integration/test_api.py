import uuid

from app.domains.llms.models import LLMModel
from fastapi.testclient import TestClient


def test_compare_models_returns_grouped_results(
    api_client: TestClient,
    comparison_seed_data: tuple[LLMModel, LLMModel],
) -> None:
    first_model, second_model = comparison_seed_data

    response = api_client.post(
        "/comparisons",
        json={"model_ids": [str(first_model.id), str(second_model.id)]},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["mmlu"]["acc"] == [
        {
            "model_id": str(second_model.id),
            "model_name": second_model.name,
            "value": 0.91,
        },
        {
            "model_id": str(first_model.id),
            "model_name": first_model.name,
            "value": 0.82,
        },
    ]
    assert data["gsm8k"]["exact_match"][0]["value"] == 0.64
    assert "exact_match" not in data["mmlu"] or len(data["mmlu"]["exact_match"]) == 1


def test_compare_models_dedupes_duplicate_model_ids(
    api_client: TestClient,
    comparison_seed_data: tuple[LLMModel, LLMModel],
) -> None:
    first_model, _ = comparison_seed_data

    response = api_client.post(
        "/comparisons",
        json={"model_ids": [str(first_model.id), str(first_model.id)]},
    )

    assert response.status_code == 200
    data = response.json()
    assert len(data["mmlu"]["acc"]) == 1


def test_compare_models_returns_not_found_for_missing_model(
    api_client: TestClient,
    comparison_seed_data: tuple[LLMModel, LLMModel],
) -> None:
    first_model, _ = comparison_seed_data

    response = api_client.post(
        "/comparisons",
        json={"model_ids": [str(first_model.id), str(uuid.uuid4())]},
    )

    assert response.status_code == 404


def test_compare_models_returns_validation_error_for_invalid_model_id(
    api_client: TestClient,
) -> None:
    response = api_client.post("/comparisons", json={"model_ids": ["not-a-uuid"]})

    assert response.status_code == 422


def test_compare_models_returns_empty_payload_for_empty_model_ids(
    api_client: TestClient,
) -> None:
    response = api_client.post("/comparisons", json={"model_ids": []})

    assert response.status_code == 200
    assert response.json() == {}
