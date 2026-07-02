from fastapi import APIRouter

from app.api import comparisons, evaluations, leaderboard, llms, users


api_router = APIRouter()
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(llms.router, prefix="/llms", tags=["llms"])
api_router.include_router(
    evaluations.router, prefix="/evaluations", tags=["evaluations"]
)
api_router.include_router(
    comparisons.router, prefix="/comparisons", tags=["comparisons"]
)
api_router.include_router(
    leaderboard.router, prefix="/leaderboard", tags=["leaderboard"]
)
