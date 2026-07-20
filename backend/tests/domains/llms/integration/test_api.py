import uuid
from collections.abc import Callable

from app.domains.llms.models import LLMModel
from fastapi.testclient import TestClient
import pytest


def test_create_llm_returns_created(
    api_client: TestClient,
    make_llm_payload: Callable[..., dict[str, str]],
) -> None:
    payload = make_llm_payload(name="Created Model")

    response = api_client.post("/llms", json=payload)

    assert response.status_code == 201
    data = response.json()
    assert data["name"] == payload["name"]
    assert data["endpoint"] == payload["endpoint"]


def test_create_llm_returns_conflict_for_duplicate_name(
    api_client: TestClient,
    make_llm_payload: Callable[..., dict[str, str]],
) -> None:
    payload = make_llm_payload(name="Duplicate Model")

    first_response = api_client.post("/llms", json=payload)
    second_response = api_client.post("/llms", json=payload)

    assert first_response.status_code == 201
    assert second_response.status_code == 409


@pytest.mark.parametrize(
    "missing_field",
    ["name", "endpoint", "description", "provider", "api_key"],
)
def test_create_llm_returns_validation_error_for_missing_required_field(
    api_client: TestClient,
    make_llm_payload: Callable[..., dict[str, str]],
    missing_field: str,
) -> None:
    payload = make_llm_payload()
    del payload[missing_field]

    response = api_client.post("/llms", json=payload)

    assert response.status_code == 422


def test_get_llm_returns_existing_model(
    api_client: TestClient,
    seed_llm: Callable[..., LLMModel],
) -> None:
    llm = seed_llm(name="Readable Model")

    response = api_client.get(f"/llms/{llm.id}")

    assert response.status_code == 200
    assert response.json()["id"] == str(llm.id)
    assert response.json()["name"] == llm.name


def test_get_llm_returns_not_found_for_missing_model(
    api_client: TestClient,
) -> None:
    response = api_client.get(f"/llms/{uuid.uuid4()}")

    assert response.status_code == 404


def test_get_llm_returns_validation_error_for_invalid_id(
    api_client: TestClient,
) -> None:
    response = api_client.get("/llms/not-a-uuid")

    assert response.status_code == 422


def test_list_llms_returns_models_with_pagination(
    api_client: TestClient,
    seed_ordered_llms: list[LLMModel],
) -> None:
    response = api_client.get("/llms", params={"offset": 1, "limit": 1})

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["id"] == str(seed_ordered_llms[1].id)


@pytest.mark.parametrize("limit", [0, 101])
def test_list_llms_returns_validation_error_for_invalid_limit(
    api_client: TestClient,
    limit: int,
) -> None:
    response = api_client.get("/llms", params={"limit": limit})

    assert response.status_code == 422


def test_patch_llm_returns_updated_model(
    api_client: TestClient,
    seed_llm: Callable[..., LLMModel],
) -> None:
    llm = seed_llm(name="Patchable Model", description="Original description")

    response = api_client.patch(
        f"/llms/{llm.id}",
        json={"description": "Updated description"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["name"] == llm.name
    assert data["description"] == "Updated description"


def test_patch_llm_allows_same_name(
    api_client: TestClient,
    seed_llm: Callable[..., LLMModel],
) -> None:
    llm = seed_llm(name="Same Name Model")

    response = api_client.patch(f"/llms/{llm.id}", json={"name": llm.name})

    assert response.status_code == 200
    assert response.json()["name"] == llm.name


def test_patch_llm_returns_conflict_for_duplicate_name(
    api_client: TestClient,
    seed_llm: Callable[..., LLMModel],
) -> None:
    first_llm = seed_llm(name="First Model")
    second_llm = seed_llm(name="Second Model")

    response = api_client.patch(
        f"/llms/{second_llm.id}",
        json={"name": first_llm.name},
    )

    assert response.status_code == 409


def test_patch_llm_returns_not_found_for_missing_model(
    api_client: TestClient,
) -> None:
    response = api_client.patch(
        f"/llms/{uuid.uuid4()}",
        json={"description": "Updated description"},
    )

    assert response.status_code == 404


def test_delete_llm_returns_no_content(
    api_client: TestClient,
    seed_llm: Callable[..., LLMModel],
) -> None:
    llm = seed_llm(name="Deleted Model")

    response = api_client.delete(f"/llms/{llm.id}")
    follow_up_response = api_client.get(f"/llms/{llm.id}")

    assert response.status_code == 204
    assert follow_up_response.status_code == 404


def test_delete_llm_returns_not_found_for_missing_model(
    api_client: TestClient,
) -> None:
    response = api_client.delete(f"/llms/{uuid.uuid4()}")

    assert response.status_code == 404
