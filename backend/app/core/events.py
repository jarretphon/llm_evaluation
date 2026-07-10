import aio_pika
from fastapi import FastAPI

from app.core.config import settings


async def connect_to_broker(app: FastAPI) -> None:
    """
    Connects to the RabbitMQ broker and stores the connection in the FastAPI app state.
    """
    app.state.amqp_connection = await aio_pika.connect_robust(settings.broker_url)


async def disconnect_from_broker(app: FastAPI) -> None:
    """
    Disconnects from the RabbitMQ broker and cleans up the connection in the FastAPI app state.
    """
    if hasattr(app.state, "amqp_connection"):
        await app.state.amqp_connection.close()
