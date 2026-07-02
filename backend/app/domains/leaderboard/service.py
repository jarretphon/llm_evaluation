from functools import lru_cache

from app.domains.evaluations.traversal import get_root_groups
from app.domains.leaderboard.errors import (
    InvalidLeaderboardBenchmarkError,
    NoLeaderboardBenchmarksSelectedError,
)
from app.domains.leaderboard.repository import (
    LeaderboardBenchmarkScore,
    LeaderboardModelRow,
    LeaderboardRepository,
)
from app.domains.leaderboard.schemas import (
    LeaderboardRead,
    LeaderboardRequest,
    LeaderboardRowRead,
    LeaderboardScoreRead,
)
from lm_eval.tasks import TaskManager


class LeaderboardService:
    def __init__(self, repository: LeaderboardRepository) -> None:
        self.repository = repository

    @lru_cache(maxsize=1)
    def get_task_manager(self) -> TaskManager:
        return TaskManager()

    def list_benchmark_options(self) -> dict[str, list[str]]:
        return get_root_groups(self.get_task_manager())

    def get_leaderboard(
        self, leaderboard_request: LeaderboardRequest
    ) -> LeaderboardRead:
        selected_benchmarks = self._dedupe_benchmarks(leaderboard_request.benchmarks)
        self._validate_benchmarks(selected_benchmarks)

        leaderboard_rows = self.repository.get_leaderboard_rows(selected_benchmarks)

        return LeaderboardRead(
            selected_benchmarks=selected_benchmarks,
            rows=self._build_leaderboard_rows(
                leaderboard_rows=leaderboard_rows,
                selected_benchmarks=selected_benchmarks,
            ),
        )

    def _dedupe_benchmarks(self, benchmarks: list[str]) -> list[str]:
        return list(dict.fromkeys(benchmarks))

    def _validate_benchmarks(self, selected_benchmarks: list[str]) -> None:
        if not selected_benchmarks:
            raise NoLeaderboardBenchmarksSelectedError()

        valid_benchmarks = {
            benchmark
            for benchmarks in self.list_benchmark_options().values()
            for benchmark in benchmarks
        }
        invalid_benchmarks = sorted(set(selected_benchmarks) - valid_benchmarks)
        if invalid_benchmarks:
            raise InvalidLeaderboardBenchmarkError(invalid_benchmarks)

    def _build_leaderboard_rows(
        self,
        leaderboard_rows: list[LeaderboardModelRow],
        selected_benchmarks: list[str],
    ) -> list[LeaderboardRowRead]:
        rows = []
        next_rank = 1

        for leaderboard_row in leaderboard_rows:
            is_ranked = (
                leaderboard_row.completed_benchmark_count
                == leaderboard_row.selected_benchmark_count
                and leaderboard_row.weighted_average is not None
            )
            rank = next_rank if is_ranked else None
            if is_ranked:
                next_rank += 1

            rows.append(
                LeaderboardRowRead(
                    rank=rank,
                    model_id=leaderboard_row.model_id,
                    model_name=leaderboard_row.model_name,
                    provider=leaderboard_row.provider,
                    weighted_average=leaderboard_row.weighted_average,
                    completed_benchmark_count=(
                        leaderboard_row.completed_benchmark_count
                    ),
                    selected_benchmark_count=(
                        leaderboard_row.selected_benchmark_count
                    ),
                    scores={
                        benchmark: self._build_benchmark_score(
                            leaderboard_row.scores.get(benchmark)
                        )
                        for benchmark in selected_benchmarks
                    },
                )
            )

        return rows

    def _build_benchmark_score(
        self, score: LeaderboardBenchmarkScore | None
    ) -> LeaderboardScoreRead:
        if score is None:
            return LeaderboardScoreRead()

        return LeaderboardScoreRead(
            value=score.value,
            metric=score.metric_name,
            effective_sample_count=score.effective_sample_count,
        )
