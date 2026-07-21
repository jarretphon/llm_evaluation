import uuid
from datetime import UTC, datetime, timedelta

from app.domains.evaluations.models import (
    BenchmarkModel,
    EvaluationMetadata,
    EvaluationModel,
    EvaluationStatus,
    MetricModel,
)
from app.domains.llms.models import LLMModel
from sqlmodel import Session


def seed_evaluation(
    session: Session,
    *,
    llm: LLMModel,
    status: EvaluationStatus = EvaluationStatus.QUEUED,
    progress: float = 0.0,
    benchmarks: list[BenchmarkModel] | None = None,
    started_at: datetime | None = None,
    completed_at: datetime | None = None,
    duration: float = 0.0,
) -> EvaluationModel:
    evaluation = EvaluationModel(
        id=uuid.uuid4(),
        llm_id=llm.id,
        status=status,
        progress=progress,
        metadata_entry=EvaluationMetadata(
            started_at=started_at or datetime.now(UTC),
            completed_at=completed_at,
            duration=duration,
        ),
        benchmarks=benchmarks
        if benchmarks is not None
        else [
            BenchmarkModel(
                name="mmlu",
                status=EvaluationStatus.COMPLETED,
                n_samples=20,
                metrics=[MetricModel(name="acc", value=0.8)],
            )
        ],
    )
    session.add(evaluation)
    session.commit()
    session.refresh(evaluation)
    return evaluation


def seed_evaluation_with_metrics(
    session: Session,
    *,
    llm: LLMModel,
    completed_at: datetime,
    status: EvaluationStatus = EvaluationStatus.COMPLETED,
    benchmark_metrics: dict[str, dict[str, float | None]] | None = None,
) -> EvaluationModel:
    benchmark_metrics = benchmark_metrics or {"mmlu": {"acc": 0.8}}
    return seed_evaluation(
        session,
        llm=llm,
        status=status,
        progress=100.0 if status == EvaluationStatus.COMPLETED else 50.0,
        started_at=completed_at - timedelta(minutes=10),
        completed_at=completed_at if status == EvaluationStatus.COMPLETED else None,
        duration=600.0 if status == EvaluationStatus.COMPLETED else 0.0,
        benchmarks=[
            BenchmarkModel(
                name=benchmark_name,
                status=status,
                n_samples=100,
                metrics=[
                    MetricModel(name=metric_name, value=metric_value)
                    for metric_name, metric_value in metrics.items()
                ],
            )
            for benchmark_name, metrics in benchmark_metrics.items()
        ],
    )


def make_lm_eval_result(
    task_name: str,
    *,
    acc: float,
    effective_samples: int,
    original_samples: int | None = None,
) -> dict:
    sample_count = original_samples if original_samples is not None else effective_samples

    return {
        "results": {
            task_name: {
                "acc,none": acc,
            }
        },
        "configs": {
            task_name: {
                "metric_list": [
                    {
                        "metric": "acc",
                        "aggregation": "mean",
                        "higher_is_better": True,
                    },
                ]
            }
        },
        "versions": {
            task_name: 1.0,
        },
        "n-shot": {
            task_name: 0,
        },
        "higher_is_better": {
            task_name: {
                "acc": True,
            }
        },
        "n-samples": {
            task_name: {
                "original": sample_count,
                "effective": effective_samples,
            }
        },
        "samples": {
            task_name: [],
        },
    }
