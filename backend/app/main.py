from contextlib import asynccontextmanager

import aio_pika
from fastapi import FastAPI

from app.api.router import api_router
from app.core.config import settings
from app.core.exceptions import register_exception_handlers
from app.core.middleware import setup_cors_middleware
from app.db.session import create_db_and_tables
from app.domains.evaluations.notifications import EVALUATION_UPDATES_EXCHANGE


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    app.state.amqp_connection = await aio_pika.connect_robust(settings.broker_url)
    channel = await app.state.amqp_connection.channel()
    await channel.declare_exchange(
        EVALUATION_UPDATES_EXCHANGE,
        aio_pika.ExchangeType.TOPIC,
    )
    await channel.close()

    yield

    await app.state.amqp_connection.close()


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
