import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    app_name: str = os.getenv("APP_NAME", "Users API")
    database_url: str = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres:12345678@localhost:5432/postgres",
    )


settings = Settings()
