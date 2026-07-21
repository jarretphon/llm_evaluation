from fastapi.testclient import TestClient

from tests.seeds.leaderboard import LEADERBOARD_BENCHMARK_OPTIONS, LeaderboardSeedData


def test_get_leaderboard_benchmark_options_returns_grouped_options(
    api_client: TestClient,
) -> None:
    response = api_client.get("/leaderboard/benchmarks")

    assert response.status_code == 200
    assert response.json() == LEADERBOARD_BENCHMARK_OPTIONS


def test_get_leaderboard_returns_ranked_rows(
    api_client: TestClient,
    leaderboard_seed_data: LeaderboardSeedData,
) -> None:
    response = api_client.post("/leaderboard", json={"benchmarks": ["mmlu", "gsm8k"]})

    assert response.status_code == 200
    data = response.json()
    assert data["selected_benchmarks"] == ["mmlu", "gsm8k"]

    rows = _rows_by_model_name(data["rows"])
    complete_high = rows[leaderboard_seed_data.complete_high.name]
    assert complete_high["rank"] == 1
    assert complete_high["model_id"] == str(leaderboard_seed_data.complete_high.id)
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

    complete_low = rows[leaderboard_seed_data.complete_low.name]
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
    leaderboard_seed_data: LeaderboardSeedData,
) -> None:
    response = api_client.post(
        "/leaderboard",
        json={"benchmarks": ["mmlu", "gsm8k", "mmlu"]},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["selected_benchmarks"] == ["mmlu", "gsm8k"]
    row = _rows_by_model_name(data["rows"])[leaderboard_seed_data.complete_high.name]
    assert row["selected_benchmark_count"] == 2
    assert row["completed_benchmark_count"] == 2


def test_get_leaderboard_returns_missing_scores_as_missing_keys(
    api_client: TestClient,
    leaderboard_seed_data: LeaderboardSeedData,
) -> None:
    response = api_client.post("/leaderboard", json={"benchmarks": ["mmlu", "gsm8k"]})

    assert response.status_code == 200
    rows = _rows_by_model_name(response.json()["rows"])
    incomplete = rows[leaderboard_seed_data.incomplete_high_score.name]
    assert incomplete["rank"] is None
    assert set(incomplete["scores"]) == {"mmlu"}


def test_get_leaderboard_returns_validation_error_for_invalid_body(
    api_client: TestClient,
) -> None:
    response = api_client.post("/leaderboard", json={"benchmarks": "mmlu"})

    assert response.status_code == 422


def _rows_by_model_name(rows: list[dict]) -> dict[str, dict]:
    return {row["model_name"]: row for row in rows}
