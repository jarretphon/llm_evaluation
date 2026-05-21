from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.domains.users.errors import UserNotFoundError


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(UserNotFoundError)
    async def user_not_found_handler(
        request: Request,
        exc: UserNotFoundError,
    ) -> JSONResponse:
        return JSONResponse(
            status_code=404,
            content={"detail": f"User with user_id={exc.user_id} was not found"},
        )
