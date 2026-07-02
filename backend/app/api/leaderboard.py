from fastapi import APIRouter, HTTPException, status

from app.domains.leaderboard.dependency import LeaderboardServiceDep
from app.domains.leaderboard.errors import (
    InvalidLeaderboardBenchmarkError,
    NoLeaderboardBenchmarksSelectedError,
)
from app.domains.leaderboard.schemas import LeaderboardRead, LeaderboardRequest

router = APIRouter()


@router.get("/benchmarks")
def get_leaderboard_benchmark_options(
    service: LeaderboardServiceDep,
) -> dict[str, list[str]]:
    return service.list_benchmark_options()


@router.post("")
def get_leaderboard(
    leaderboard_request: LeaderboardRequest,
    service: LeaderboardServiceDep,
) -> LeaderboardRead:
    try:
        return service.get_leaderboard(leaderboard_request)
    except (
        InvalidLeaderboardBenchmarkError,
        NoLeaderboardBenchmarksSelectedError,
    ) as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
