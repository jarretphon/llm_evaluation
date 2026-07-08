import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    app_name: str = os.getenv("APP_NAME", "Users API")
    database_url: str = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres:12345678@localhost:5432/postgres",
    )
    broker_url: str = os.getenv("BROKER_URL", "amqp://guest:guest@localhost:5672")
    result_backend_url: str = os.getenv("RESULT_BACKEND_URL", f"db+{database_url}")


settings = Settings()
