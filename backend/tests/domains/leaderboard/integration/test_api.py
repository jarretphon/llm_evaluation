from app.domains.llms.models import LLMModel
from fastapi.testclient import TestClient


def test_get_leaderboard_returns_ranked_rows(
    api_client: TestClient,
    leaderboard_seed_data: tuple[LLMModel, LLMModel, LLMModel, LLMModel, LLMModel],
) -> None:
    complete_high_model, complete_low_model, *_ = leaderboard_seed_data
    response = api_client.post("/leaderboard", json={"benchmarks": ["mmlu", "gsm8k"]})

    assert response.status_code == 200
    data = response.json()
    assert data["selected_benchmarks"] == ["mmlu", "gsm8k"]

    rows = _rows_by_model_name(data["rows"])
    complete_high = rows[complete_high_model.name]
    assert complete_high["rank"] == 1
    assert complete_high["model_id"] == str(complete_high_model.id)
    assert complete_high["weighted_average"] == 0.85
    assert complete_high["completed_benchmark_count"] == 2
    assert complete_high["selected_benchmark_count"] == 2
    assert complete_high["scores"]["mmlu"] == {
        "metric": "acc",
        "value": 0.9,
        "effective_sample_count": 30,
    }
    assert complete_high["scores"]["gsm8k"] == {
        "metric": "acc_norm",
        "value": 0.7,
        "effective_sample_count": 10,
    }

    complete_low = rows[complete_low_model.name]
    assert complete_low["rank"] == 2
    assert complete_low["weighted_average"] == 0.65


def test_get_leaderboard_returns_bad_request_for_empty_selection(
    api_client: TestClient,
) -> None:
    response = api_client.post("/leaderboard", json={"benchmarks": []})

    assert response.status_code == 400


def test_get_leaderboard_returns_bad_request_for_invalid_benchmark(
    api_client: TestClient,
) -> None:
    response = api_client.post("/leaderboard", json={"benchmarks": ["not-real"]})

    assert response.status_code == 400


def test_get_leaderboard_dedupes_duplicate_benchmarks(
    api_client: TestClient,
    leaderboard_seed_data: tuple[LLMModel, LLMModel, LLMModel, LLMModel, LLMModel],
) -> None:
    complete_high_model, *_ = leaderboard_seed_data
    response = api_client.post(
        "/leaderboard",
        json={"benchmarks": ["mmlu", "gsm8k", "mmlu"]},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["selected_benchmarks"] == ["mmlu", "gsm8k"]
    row = _rows_by_model_name(data["rows"])[complete_high_model.name]
    assert row["selected_benchmark_count"] == 2
    assert row["completed_benchmark_count"] == 2


def test_get_leaderboard_returns_missing_scores_as_missing_keys(
    api_client: TestClient,
    leaderboard_seed_data: tuple[LLMModel, LLMModel, LLMModel, LLMModel, LLMModel],
) -> None:
    _, _, incomplete_high_score_model, *_ = leaderboard_seed_data
    response = api_client.post("/leaderboard", json={"benchmarks": ["mmlu", "gsm8k"]})

    assert response.status_code == 200
    rows = _rows_by_model_name(response.json()["rows"])
    incomplete = rows[incomplete_high_score_model.name]
    assert incomplete["rank"] is None
    assert set(incomplete["scores"]) == {"mmlu"}


def test_get_leaderboard_returns_validation_error_for_invalid_body(
    api_client: TestClient,
) -> None:
    response = api_client.post("/leaderboard", json={"benchmarks": "mmlu"})

    assert response.status_code == 422


def _rows_by_model_name(rows: list[dict]) -> dict[str, dict]:
    return {row["model_name"]: row for row in rows}
