import json
from functools import lru_cache
from typing import Any

from app.domains.evaluations.traversal import get_root_groups
from app.domains.leaderboard.repository import (
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

        leaderboard_rows = [
            LeaderboardRowRead(
                rank=rank,
                model_id=model_id,
                model_name=model_name,
                provider=provider,
                weighted_average=self._round_score(weighted_average),
                completed_benchmark_count=completed_benchmark_count,
                selected_benchmark_count=len(selected_benchmarks),
                scores=self._build_scores(scores),
            )
            for (
                model_id,
                model_name,
                provider,
                weighted_average,
                completed_benchmark_count,
                rank,
                scores,
            ) in self.repository.get_leaderboard_rows(selected_benchmarks)
        ]

        return LeaderboardRead(
            selected_benchmarks=selected_benchmarks,
            rows=leaderboard_rows,
        )

    def _dedupe_benchmarks(self, benchmarks: list[str]) -> list[str]:
        return list(dict.fromkeys(benchmarks))

    def _build_scores(
        self, scores: dict[str, Any] | str | None
    ) -> dict[str, LeaderboardScoreRead]:
        if scores is None:
            return {}

        if isinstance(scores, str):
            scores = json.loads(scores)

        return {
            benchmark_name: LeaderboardScoreRead.model_validate(score)
            for benchmark_name, score in scores.items()
        }

    def _round_score(self, value: float | None) -> float | None:
        if value is None:
            return None

        return round(value, 5)
