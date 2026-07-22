import uuid
from datetime import UTC, datetime

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
    estimated_end_time: datetime | None = None,
) -> EvaluationModel:
    evaluation = build_evaluation(
        llm=llm,
        status=status,
        progress=progress,
        benchmarks=benchmarks,
        started_at=started_at,
        completed_at=completed_at,
        duration=duration,
        estimated_end_time=estimated_end_time,
    )
    session.add(evaluation)
    session.commit()
    session.refresh(evaluation)
    return evaluation


def build_evaluation(
    *,
    llm: LLMModel | None = None,
    llm_id: uuid.UUID | None = None,
    status: EvaluationStatus = EvaluationStatus.QUEUED,
    progress: float = 0.0,
    benchmarks: list[BenchmarkModel] | None = None,
    started_at: datetime | None = None,
    completed_at: datetime | None = None,
    duration: float = 0.0,
    estimated_end_time: datetime | None = None,
) -> EvaluationModel:
    evaluation_data = {
        "id": uuid.uuid4(),
        "status": status,
        "progress": progress,
        "metadata_entry": EvaluationMetadata(
            started_at=started_at or datetime.now(UTC),
            completed_at=completed_at,
            duration=duration,
            estimated_end_time=estimated_end_time,
        ),
        "benchmarks": benchmarks
        if benchmarks is not None
        else [
            build_benchmark(
                "mmlu",
                status=EvaluationStatus.COMPLETED,
                n_samples=20,
                metrics={"acc": 0.8},
            )
        ],
    }
    if llm is not None:
        evaluation_data["llm_id"] = llm.id
    elif llm_id is not None:
        evaluation_data["llm_id"] = llm_id

    return EvaluationModel(**evaluation_data)


def build_benchmark(
    name: str,
    *,
    status: EvaluationStatus = EvaluationStatus.COMPLETED,
    description: str = "",
    n_samples: int = 100,
    metrics: dict[str, float | None] | None = None,
) -> BenchmarkModel:
    return BenchmarkModel(
        name=name,
        description=description,
        status=status,
        n_samples=n_samples,
        metrics=[
            MetricModel(name=metric_name, value=metric_value)
            for metric_name, metric_value in (metrics or {}).items()
        ],
    )


def make_lm_eval_result(
    task_name: str,
    *,
    acc: float,
    effective_samples: int,
    original_samples: int | None = None,
) -> dict:
    sample_count = (
        original_samples if original_samples is not None else effective_samples
    )

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
