from dataclasses import dataclass
from datetime import UTC, datetime, timedelta

from app.domains.evaluations.models import (
    BenchmarkModel,
    EvaluationStatus,
    MetricModel,
)
from app.domains.llms.models import LLMModel
from sqlmodel import Session
from tests.seeds.evaluations import seed_evaluation
from tests.seeds.llms import seed_llm

LEADERBOARD_BENCHMARK_OPTIONS = {
    "Core": ["mmlu", "gsm8k"],
    "Reasoning": ["hellaswag"],
}


@dataclass(frozen=True)
class LeaderboardSeedData:
    complete_high: LLMModel
    complete_low: LLMModel
    incomplete_high_score: LLMModel
    benchmark_failed: LLMModel
    no_completed: LLMModel


def seed_leaderboard_data(session: Session) -> LeaderboardSeedData:
    now = datetime.now(UTC)
    complete_high = seed_llm(session, name="Alpha Complete")
    complete_low = seed_llm(session, name="Beta Complete")
    incomplete_high_score = seed_llm(session, name="Gamma Missing Benchmark")
    benchmark_failed = seed_llm(session, name="Delta Failed Benchmark")
    no_completed = seed_llm(session, name="Epsilon No Completed Evaluation")

    seed_evaluation(
        session,
        llm=complete_high,
        status=EvaluationStatus.COMPLETED,
        progress=100.0,
        started_at=now - timedelta(days=2, minutes=10),
        completed_at=now - timedelta(days=2),
        duration=600.0,
        benchmarks=[
            build_benchmark("mmlu", n_samples=30, metrics={"acc": 0.1}),
            build_benchmark("gsm8k", n_samples=10, metrics={"exact_match": 0.1}),
        ],
    )
    seed_evaluation(
        session,
        llm=complete_high,
        status=EvaluationStatus.COMPLETED,
        progress=100.0,
        started_at=now - timedelta(minutes=10),
        completed_at=now,
        duration=600.0,
        benchmarks=[
            build_benchmark(
                "mmlu",
                n_samples=30,
                metrics={
                    "acc": 0.9,
                    "acc_norm": 0.75,
                    "exact_match": 0.2,
                    "bleu": 1.0,
                },
            ),
            build_benchmark(
                "gsm8k",
                n_samples=10,
                metrics={"acc_norm": 0.7, "exact_match": 0.6},
            ),
        ],
    )
    seed_evaluation(
        session,
        llm=complete_high,
        status=EvaluationStatus.RUNNING,
        progress=50.0,
        started_at=now + timedelta(hours=1, minutes=-10),
        completed_at=None,
        benchmarks=[
            build_benchmark("mmlu", n_samples=30, metrics={"acc": 0.99}),
            build_benchmark("gsm8k", n_samples=10, metrics={"acc": 0.99}),
        ],
    )

    seed_evaluation(
        session,
        llm=complete_low,
        status=EvaluationStatus.COMPLETED,
        progress=100.0,
        started_at=now - timedelta(minutes=10),
        completed_at=now,
        duration=600.0,
        benchmarks=[
            build_benchmark(
                "mmlu",
                n_samples=20,
                metrics={"acc": 0.8, "exact_match": 0.95},
            ),
            build_benchmark(
                "gsm8k",
                n_samples=20,
                metrics={"acc": None, "exact_match": 0.5, "bleu": 1.0},
            ),
        ],
    )

    seed_evaluation(
        session,
        llm=incomplete_high_score,
        status=EvaluationStatus.COMPLETED,
        progress=100.0,
        started_at=now - timedelta(minutes=10),
        completed_at=now,
        duration=600.0,
        benchmarks=[
            build_benchmark("mmlu", n_samples=50, metrics={"acc": 0.95}),
        ],
    )

    seed_evaluation(
        session,
        llm=benchmark_failed,
        status=EvaluationStatus.COMPLETED,
        progress=100.0,
        started_at=now - timedelta(minutes=10),
        completed_at=now,
        duration=600.0,
        benchmarks=[
            build_benchmark("mmlu", n_samples=100, metrics={"acc": 0.6}),
            build_benchmark(
                "gsm8k",
                status=EvaluationStatus.FAILED,
                n_samples=100,
                metrics={"acc": 1.0},
            ),
        ],
    )

    return LeaderboardSeedData(
        complete_high=complete_high,
        complete_low=complete_low,
        incomplete_high_score=incomplete_high_score,
        benchmark_failed=benchmark_failed,
        no_completed=no_completed,
    )


def build_benchmark(
    name: str,
    *,
    n_samples: int,
    metrics: dict[str, float | None],
    status: EvaluationStatus = EvaluationStatus.COMPLETED,
) -> BenchmarkModel:
    return BenchmarkModel(
        name=name,
        status=status,
        n_samples=n_samples,
        metrics=[
            MetricModel(name=metric_name, value=metric_value)
            for metric_name, metric_value in metrics.items()
        ],
    )
