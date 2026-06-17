from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
]


def setup_cors_middleware(app: FastAPI) -> None:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
