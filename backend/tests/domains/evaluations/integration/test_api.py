import uuid
from collections.abc import Callable

from app.domains.evaluations.models import BenchmarkModel, EvaluationModel
from app.domains.llms.models import LLMModel
from fastapi.testclient import TestClient


def test_create_evaluation_returns_queued_entry_and_queues_task(
    api_client: TestClient,
    seed_llm: Callable[..., LLMModel],
    make_evaluation_payload: Callable[..., dict],
    task_queue,
) -> None:
    llm = seed_llm(name="Queued Evaluation Model")
    payload = make_evaluation_payload(
        model_id=llm.id,
        model_endpoint=llm.endpoint,
        model_name=llm.name,
        benchmarks=["mmlu", "gsm8k"],
    )

    response = api_client.post("/evaluations", json=payload)

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "queued"
    assert data["progress"] == 0.0
    assert [benchmark["name"] for benchmark in data["benchmarks"]] == ["mmlu", "gsm8k"]
    assert data["metadata_entry"]["duration"] == 0.0
    task_queue.assert_called_once_with(uuid.UUID(data["id"]))


def test_create_evaluation_returns_bad_request_when_no_benchmarks_selected(
    api_client: TestClient,
    seed_llm: Callable[..., LLMModel],
    make_evaluation_payload: Callable[..., dict],
    task_queue,
) -> None:
    llm = seed_llm(name="No Benchmark Model")
    payload = make_evaluation_payload(model_id=llm.id, benchmarks=[])

    response = api_client.post("/evaluations", json=payload)

    assert response.status_code == 400
    task_queue.assert_not_called()


def test_get_evaluation_returns_existing_evaluation(
    api_client: TestClient,
    seed_evaluation: Callable[..., EvaluationModel],
) -> None:
    evaluation = seed_evaluation()

    response = api_client.get(f"/evaluations/{evaluation.id}")

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == str(evaluation.id)
    assert data["status"] == "queued"
    assert data["benchmarks"][0]["name"] == "mmlu"
    assert data["benchmarks"][0]["effective_sample_count"] == 20
    assert data["benchmarks"][0]["metrics"][0]["name"] == "acc"
    assert data["benchmarks"][0]["metrics"][0]["value"] == 0.8


def test_get_evaluation_returns_not_found_for_missing_evaluation(
    api_client: TestClient,
) -> None:
    response = api_client.get(f"/evaluations/{uuid.uuid4()}")

    assert response.status_code == 404


def test_list_evaluations_returns_paginated_evaluations(
    api_client: TestClient,
    seed_evaluation: Callable[..., EvaluationModel],
) -> None:
    first_evaluation = seed_evaluation(
        benchmarks=[BenchmarkModel(name="mmlu"), BenchmarkModel(name="gsm8k")]
    )
    second_evaluation = seed_evaluation(benchmarks=[BenchmarkModel(name="truthfulqa")])

    response = api_client.get("/evaluations", params={"offset": 0, "limit": 2})

    assert response.status_code == 200
    data = response.json()
    returned_ids = {evaluation["id"] for evaluation in data}
    assert len(data) == 2
    assert returned_ids == {str(first_evaluation.id), str(second_evaluation.id)}


def test_get_evaluation_returns_validation_error_for_invalid_id(
    api_client: TestClient,
) -> None:
    response = api_client.get("/evaluations/not-a-uuid")

    assert response.status_code == 422
