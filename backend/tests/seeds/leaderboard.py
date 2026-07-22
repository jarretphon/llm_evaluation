from datetime import UTC, datetime, timedelta

from app.domains.evaluations.models import EvaluationStatus
from app.domains.llms.models import LLMModel
from sqlmodel import Session
from tests.seeds.evaluations import build_benchmark, build_evaluation
from tests.seeds.llms import seed_llm

LEADERBOARD_BENCHMARK_OPTIONS = {
    "Core": ["mmlu", "gsm8k"],
    "Reasoning": ["hellaswag"],
}


def seed_leaderboard_data(
    session: Session,
) -> tuple[LLMModel, LLMModel, LLMModel, LLMModel, LLMModel]:
    now = datetime.now(UTC)
    complete_high = seed_llm(
        session,
        name="Complete High",
        evaluations=[
            build_evaluation(
                status=EvaluationStatus.COMPLETED,
                progress=100.0,
                started_at=now - timedelta(days=2, minutes=10),
                completed_at=now - timedelta(days=2),
                duration=600.0,
                benchmarks=[
                    build_benchmark("mmlu", n_samples=30, metrics={"acc": 0.1}),
                    build_benchmark(
                        "gsm8k",
                        n_samples=10,
                        metrics={"exact_match": 0.1},
                    ),
                ],
            ),
            build_evaluation(
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
            ),
            build_evaluation(
                status=EvaluationStatus.RUNNING,
                progress=50.0,
                started_at=now + timedelta(minutes=50),
                completed_at=None,
                benchmarks=[
                    build_benchmark(
                        "mmlu",
                        status=EvaluationStatus.RUNNING,
                        n_samples=30,
                        metrics={"acc": 0.99},
                    ),
                    build_benchmark(
                        "gsm8k",
                        status=EvaluationStatus.RUNNING,
                        n_samples=10,
                        metrics={"acc": 0.99},
                    ),
                ],
            ),
        ],
    )

    complete_low = seed_llm(
        session,
        name="Complete Low",
        evaluations=[
            build_evaluation(
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
            ),
        ],
    )

    incomplete_high_score = seed_llm(
        session,
        name="Incomplete High Score",
        evaluations=[
            build_evaluation(
                status=EvaluationStatus.COMPLETED,
                progress=100.0,
                started_at=now - timedelta(minutes=10),
                completed_at=now,
                duration=600.0,
                benchmarks=[
                    build_benchmark("mmlu", n_samples=50, metrics={"acc": 0.95}),
                ],
            ),
        ],
    )

    benchmark_failed = seed_llm(
        session,
        name="Benchmark Failed",
        evaluations=[
            build_evaluation(
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
            ),
        ],
    )

    no_completed = seed_llm(
        session,
        name="No Completed Evaluation",
        evaluations=[],
    )

    return (
        complete_high,
        complete_low,
        incomplete_high_score,
        benchmark_failed,
        no_completed,
    )
