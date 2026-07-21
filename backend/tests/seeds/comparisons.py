from datetime import UTC, datetime, timedelta

from app.domains.evaluations.models import EvaluationStatus
from app.domains.llms.models import LLMModel
from sqlmodel import Session
from tests.seeds.evaluations import seed_evaluation_with_metrics
from tests.seeds.llms import seed_llm


def seed_comparison_data(session: Session) -> tuple[LLMModel, LLMModel]:
    now = datetime.now(UTC)
    first_model = seed_llm(session, name="Comparison Model A")
    second_model = seed_llm(session, name="Comparison Model B")

    seed_evaluation_with_metrics(
        session,
        llm=first_model,
        completed_at=now - timedelta(days=1),
        benchmark_metrics={
            "mmlu": {"acc": 0.1},
            "gsm8k": {"exact_match": 0.2},
        },
    )
    seed_evaluation_with_metrics(
        session,
        llm=first_model,
        completed_at=now,
        benchmark_metrics={
            "mmlu": {"acc": 0.82, "exact_match": 0.78},
            "gsm8k": {"exact_match": 0.64},
        },
    )
    seed_evaluation_with_metrics(
        session,
        llm=first_model,
        completed_at=now + timedelta(hours=1),
        status=EvaluationStatus.RUNNING,
        benchmark_metrics={"mmlu": {"acc": 0.99}},
    )
    seed_evaluation_with_metrics(
        session,
        llm=second_model,
        completed_at=now,
        benchmark_metrics={
            "mmlu": {"acc": 0.91, "exact_match": None},
            "hellaswag": {"acc_norm": 0.74},
        },
    )

    return first_model, second_model
