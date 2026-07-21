import json
import uuid

import pytest
from app.domains.leaderboard.errors import (
    InvalidLeaderboardBenchmarkError,
    NoLeaderboardBenchmarksSelectedError,
)
from app.domains.leaderboard.schemas import LeaderboardRequest
from app.domains.leaderboard.service import LeaderboardService


BENCHMARK_OPTIONS = {"Core": ["mmlu", "gsm8k"], "Reasoning": ["hellaswag"]}


class FakeLeaderboardRepository:
    def __init__(self, rows=None) -> None:
        self.rows = rows or []
        self.leaderboard_calls = []

    def get_leaderboard_rows(self, benchmark_names: list[str]):
        self.leaderboard_calls.append(benchmark_names)
        return self.rows


def test_list_benchmark_options_returns_root_groups(mocker) -> None:
    repository = FakeLeaderboardRepository()
    service = LeaderboardService(repository)
    task_manager = object()
    mocker.patch.object(service, "get_task_manager", return_value=task_manager)
    get_root_groups = mocker.patch(
        "app.domains.leaderboard.service.get_root_groups",
        return_value=BENCHMARK_OPTIONS,
    )

    options = service.list_benchmark_options()

    assert options == BENCHMARK_OPTIONS
    get_root_groups.assert_called_once_with(task_manager)


def test_get_leaderboard_dedupes_selected_benchmarks_in_request_order(
    mocker,
) -> None:
    repository = FakeLeaderboardRepository()
    service = LeaderboardService(repository)
    mocker.patch.object(service, "list_benchmark_options", return_value=BENCHMARK_OPTIONS)

    leaderboard = service.get_leaderboard(
        LeaderboardRequest(benchmarks=["mmlu", "gsm8k", "mmlu"])
    )

    assert leaderboard.selected_benchmarks == ["mmlu", "gsm8k"]
    assert repository.leaderboard_calls == [["mmlu", "gsm8k"]]


def test_get_leaderboard_raises_when_no_benchmarks_are_selected(mocker) -> None:
    repository = FakeLeaderboardRepository()
    service = LeaderboardService(repository)
    mocker.patch.object(service, "list_benchmark_options", return_value=BENCHMARK_OPTIONS)

    with pytest.raises(NoLeaderboardBenchmarksSelectedError):
        service.get_leaderboard(LeaderboardRequest(benchmarks=[]))

    assert repository.leaderboard_calls == []


def test_get_leaderboard_raises_when_benchmark_is_invalid(mocker) -> None:
    repository = FakeLeaderboardRepository()
    service = LeaderboardService(repository)
    mocker.patch.object(service, "list_benchmark_options", return_value=BENCHMARK_OPTIONS)

    with pytest.raises(InvalidLeaderboardBenchmarkError) as exc_info:
        service.get_leaderboard(LeaderboardRequest(benchmarks=["mmlu", "not-real"]))

    assert exc_info.value.benchmarks == ["not-real"]
    assert repository.leaderboard_calls == []


def test_get_leaderboard_builds_read_schema_from_repository_rows(mocker) -> None:
    model_id = uuid.uuid4()
    repository = FakeLeaderboardRepository(
        rows=[
            (
                model_id,
                "Test Model",
                "OpenAI",
                0.876543,
                1,
                1,
                {
                    "mmlu": {
                        "metric": "acc",
                        "value": 0.876543,
                        "effective_sample_count": 42,
                    }
                },
            )
        ]
    )
    service = LeaderboardService(repository)
    mocker.patch.object(service, "list_benchmark_options", return_value=BENCHMARK_OPTIONS)

    leaderboard = service.get_leaderboard(LeaderboardRequest(benchmarks=["mmlu"]))

    assert leaderboard.selected_benchmarks == ["mmlu"]
    assert len(leaderboard.rows) == 1
    row = leaderboard.rows[0]
    assert row.rank == 1
    assert row.model_id == model_id
    assert row.model_name == "Test Model"
    assert row.weighted_average == 0.87654
    assert row.completed_benchmark_count == 1
    assert row.selected_benchmark_count == 1
    assert row.scores["mmlu"].metric == "acc"
    assert row.scores["mmlu"].value == 0.876543
    assert row.scores["mmlu"].effective_sample_count == 42


def test_get_leaderboard_parses_scores_returned_as_json_strings(mocker) -> None:
    model_id = uuid.uuid4()
    repository = FakeLeaderboardRepository(
        rows=[
            (
                model_id,
                "Test Model",
                "OpenAI",
                0.75,
                1,
                1,
                json.dumps(
                    {
                        "gsm8k": {
                            "metric": "exact_match",
                            "value": 0.75,
                            "effective_sample_count": 20,
                        }
                    }
                ),
            )
        ]
    )
    service = LeaderboardService(repository)
    mocker.patch.object(service, "list_benchmark_options", return_value=BENCHMARK_OPTIONS)

    leaderboard = service.get_leaderboard(LeaderboardRequest(benchmarks=["gsm8k"]))

    assert leaderboard.rows[0].scores["gsm8k"].metric == "exact_match"
    assert leaderboard.rows[0].scores["gsm8k"].value == 0.75
    assert leaderboard.rows[0].scores["gsm8k"].effective_sample_count == 20
