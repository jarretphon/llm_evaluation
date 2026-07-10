from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api.router import api_router
from app.core.config import settings
from app.core.events import connect_to_broker, disconnect_from_broker
from app.core.exceptions import register_exception_handlers
from app.core.middleware import setup_cors_middleware
from app.db.session import create_db_and_tables


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    await connect_to_broker(app)

    yield

    await disconnect_from_broker(app)


def create_app() -> FastAPI:
    app = FastAPI(title=settings.app_name, lifespan=lifespan)

    register_exception_handlers(app)
    setup_cors_middleware(app)
    app.include_router(api_router)

    @app.get("/")
    def read_root():
        return {"message": "Hello World"}

    return app


app = create_app()
