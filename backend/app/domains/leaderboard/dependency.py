from typing import Annotated

from app.db.session import SessionDep
from app.domains.leaderboard.repository import LeaderboardRepository
from app.domains.leaderboard.service import LeaderboardService
from fastapi import Depends


def get_leaderboard_service(session: SessionDep) -> LeaderboardService:
    repository = LeaderboardRepository(session)
    return LeaderboardService(repository)


LeaderboardServiceDep = Annotated[
    LeaderboardService, Depends(get_leaderboard_service)
]
