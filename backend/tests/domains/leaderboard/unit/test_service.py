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
    get_cached_benchmark_options = mocker.patch(
        "app.domains.leaderboard.service.get_cached_benchmark_options",
        return_value=BENCHMARK_OPTIONS,
    )

    options = service.list_benchmark_options()

    assert options == BENCHMARK_OPTIONS
    get_cached_benchmark_options.assert_called_once_with()


def test_get_leaderboard_raises_when_no_benchmarks_are_selected(mocker) -> None:
    repository = FakeLeaderboardRepository()
    service = LeaderboardService(repository)
    mocker.patch.object(
        service, "list_benchmark_options", return_value=BENCHMARK_OPTIONS
    )

    with pytest.raises(NoLeaderboardBenchmarksSelectedError):
        service.get_leaderboard(LeaderboardRequest(benchmarks=[]))

    assert repository.leaderboard_calls == []


def test_get_leaderboard_raises_when_benchmark_is_invalid(mocker) -> None:
    repository = FakeLeaderboardRepository()
    service = LeaderboardService(repository)
    mocker.patch.object(
        service, "list_benchmark_options", return_value=BENCHMARK_OPTIONS
    )

    with pytest.raises(InvalidLeaderboardBenchmarkError) as exc_info:
        service.get_leaderboard(LeaderboardRequest(benchmarks=["mmlu", "not-real"]))

    assert exc_info.value.benchmarks == ["not-real"]
    assert repository.leaderboard_calls == []
