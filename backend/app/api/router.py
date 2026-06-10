from fastapi import APIRouter

from app.api import evaluations, llms, users

api_router = APIRouter()
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(llms.router, prefix="/llms", tags=["llms"])
api_router.include_router(
    evaluations.router, prefix="/evaluations", tags=["evaluations"]
)
