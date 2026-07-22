from datetime import UTC, datetime, timedelta

from app.domains.evaluations.models import EvaluationStatus
from app.domains.llms.models import LLMModel
from sqlmodel import Session

from tests.seeds.evaluations import build_benchmark, build_evaluation
from tests.seeds.llms import seed_llm


def seed_comparison_data(session: Session) -> tuple[LLMModel, LLMModel]:
    now = datetime.now(UTC)
    first_model = seed_llm(
        session,
        name="Comparison Model A",
        evaluations=[
            build_evaluation(
                status=EvaluationStatus.COMPLETED,
                progress=100.0,
                started_at=now - timedelta(days=1, minutes=10),
                completed_at=now - timedelta(days=1),
                duration=600.0,
                benchmarks=[
                    build_benchmark("mmlu", metrics={"acc": 0.1}),
                    build_benchmark("gsm8k", metrics={"exact_match": 0.2}),
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
                        metrics={"acc": 0.82, "exact_match": 0.78},
                    ),
                    build_benchmark("gsm8k", metrics={"exact_match": 0.64}),
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
                        metrics={"acc": 0.99},
                    ),
                ],
            ),
        ],
    )
    second_model = seed_llm(
        session,
        name="Comparison Model B",
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
                        metrics={"acc": 0.91, "exact_match": None},
                    ),
                    build_benchmark("hellaswag", metrics={"acc_norm": 0.74}),
                ],
            ),
        ],
    )

    return first_model, second_model
