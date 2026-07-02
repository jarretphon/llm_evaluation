import uuid

from pydantic import BaseModel, Field


class LeaderboardRequest(BaseModel):
    benchmarks: list[str] = Field(default_factory=list)


class LeaderboardScoreRead(BaseModel):
    value: float | None = None
    metric: str | None = None
    effective_sample_count: int = 0


class LeaderboardRowRead(BaseModel):
    rank: int | None = None
    model_id: uuid.UUID
    model_name: str
    provider: str
    weighted_average: float | None = None
    completed_benchmark_count: int
    selected_benchmark_count: int
    scores: dict[str, LeaderboardScoreRead]


class LeaderboardRead(BaseModel):
    selected_benchmarks: list[str]
    rows: list[LeaderboardRowRead]
