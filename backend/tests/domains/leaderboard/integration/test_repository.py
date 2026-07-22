import json
from collections.abc import Callable
from datetime import UTC, datetime
from typing import Any

import pytest
from app.domains.evaluations.models import EvaluationStatus
from app.domains.leaderboard.repository import LeaderboardRepository
from app.domains.llms.models import LLMModel

from tests.seeds.evaluations import build_benchmark


def test_get_leaderboard_rows_ranks_complete_models_and_uses_latest_scores(
    leaderboard_repository: LeaderboardRepository,
    leaderboard_seed_data: tuple[LLMModel, LLMModel, LLMModel, LLMModel, LLMModel],
) -> None:
    (
        complete_high_model,
        complete_low_model,
        incomplete_high_score_model,
        benchmark_failed_model,
        no_completed_model,
    ) = leaderboard_seed_data
    rows = _rows_by_model_name(
        leaderboard_repository.get_leaderboard_rows(["mmlu", "gsm8k"])
    )

    assert list(rows) == [
        "Complete High",
        "Complete Low",
        "Incomplete High Score",
        "Benchmark Failed",
        "No Completed Evaluation",
    ]

    complete_high = rows[complete_high_model.name]
    assert complete_high["rank"] == 1
    assert complete_high["completed_benchmark_count"] == 2
    assert complete_high["weighted_average"] == pytest.approx(0.85)
    assert complete_high["scores"] == {
        "mmlu": {
            "metric": "acc",
            "value": 0.9,
            "effective_sample_count": 30,
        },
        "gsm8k": {
            "metric": "acc_norm",
            "value": 0.7,
            "effective_sample_count": 10,
        },
    }

    complete_low = rows[complete_low_model.name]
    assert complete_low["rank"] == 2
    assert complete_low["completed_benchmark_count"] == 2
    assert complete_low["weighted_average"] == pytest.approx(0.65)
    assert complete_low["scores"]["mmlu"]["metric"] == "acc"
    assert complete_low["scores"]["mmlu"]["value"] == 0.8
    assert complete_low["scores"]["gsm8k"]["metric"] == "exact_match"
    assert complete_low["scores"]["gsm8k"]["value"] == 0.5

    incomplete = rows[incomplete_high_score_model.name]
    assert incomplete["rank"] is None
    assert incomplete["completed_benchmark_count"] == 1
    assert incomplete["weighted_average"] == pytest.approx(0.95)
    assert set(incomplete["scores"]) == {"mmlu"}

    failed_benchmark = rows[benchmark_failed_model.name]
    assert failed_benchmark["rank"] is None
    assert failed_benchmark["completed_benchmark_count"] == 1
    assert failed_benchmark["weighted_average"] == pytest.approx(0.6)
    assert set(failed_benchmark["scores"]) == {"mmlu"}

    no_completed = rows[no_completed_model.name]
    assert no_completed["rank"] is None
    assert no_completed["completed_benchmark_count"] == 0
    assert no_completed["weighted_average"] is None
    assert no_completed["scores"] == {}


def test_get_leaderboard_rows_dedupes_selected_benchmarks(
    leaderboard_repository: LeaderboardRepository,
    leaderboard_seed_data: tuple[LLMModel, LLMModel, LLMModel, LLMModel, LLMModel],
) -> None:
    complete_high_model, *_ = leaderboard_seed_data
    rows = _rows_by_model_name(
        leaderboard_repository.get_leaderboard_rows(["mmlu", "gsm8k", "mmlu"])
    )

    complete_high = rows[complete_high_model.name]
    assert complete_high["rank"] == 1
    assert complete_high["completed_benchmark_count"] == 2
    assert complete_high["weighted_average"] == pytest.approx(0.85)


def test_get_leaderboard_rows_orders_tied_complete_models_by_name(
    leaderboard_repository: LeaderboardRepository,
    seed_llm: Callable[..., LLMModel],
    seed_evaluation,
    db_session,
) -> None:
    second_model = seed_llm(name="B Tie Model")
    first_model = seed_llm(name="A Tie Model")

    for model in [second_model, first_model]:
        seed_evaluation(
            llm=model,
            status=EvaluationStatus.COMPLETED,
            progress=100.0,
            started_at=datetime.now(UTC),
            completed_at=datetime.now(UTC),
            duration=600.0,
            benchmarks=[
                build_benchmark("mmlu", n_samples=10, metrics={"acc": 0.75}),
            ],
        )

    rows = _rows_by_model_name(leaderboard_repository.get_leaderboard_rows(["mmlu"]))

    assert list(rows) == ["A Tie Model", "B Tie Model"]
    assert rows["A Tie Model"]["rank"] == 1
    assert rows["B Tie Model"]["rank"] == 2


def _rows_by_model_name(rows) -> dict[str, dict[str, Any]]:
    results = {}
    for row in rows:
        normalized_row = _normalize_row(row)
        results[normalized_row["model_name"]] = normalized_row

    return results


def _normalize_row(row) -> dict[str, Any]:
    (
        model_id,
        model_name,
        provider,
        weighted_average,
        completed_benchmark_count,
        rank,
        scores,
    ) = row

    if isinstance(scores, str):
        scores = json.loads(scores)

    return {
        "model_id": model_id,
        "model_name": model_name,
        "provider": provider,
        "weighted_average": weighted_average,
        "completed_benchmark_count": completed_benchmark_count,
        "rank": rank,
        "scores": scores or {},
    }
