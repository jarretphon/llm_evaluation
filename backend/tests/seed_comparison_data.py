import json
from datetime import timedelta

from app.db.session import engine
from app.domains.evaluations.models import (
    BenchmarkModel,
    EvaluationMetadata,
    EvaluationModel,
    EvaluationStatus,
    MetricModel,
    utc_now,
)
from app.domains.llms.models import LLMModel
from sqlmodel import Session, SQLModel, select

SEEDED_MODELS = [
    {
        "name": "testing-model-1",
        "endpoint": "https://api.testing-model-1.com",
        "api_key": "asdfasd",
        "description": "Seeded comparison model Alpha",
        "provider": "Mock",
        "benchmarks": {
            "mmlu": {
                "acc": "0.82",
                "acc,stderr": "0.02",
                "exact_match": "0.79",
                "exact_match,stderr": "0.03",
            },
            "hellaswag": {
                "acc_norm": "0.74",
                "acc_norm,stderr": "0.01",
            },
        },
    },
    {
        "name": "testing-model-2",
        "endpoint": "https://api.testing-model-2.com",
        "api_key": "asdfasdsdafsad",
        "description": "Seeded comparison model Beta",
        "provider": "Mock",
        "benchmarks": {
            "mmlu": {
                "acc": "0.78",
                "acc,stderr": "0.03",
            },
            "hellaswag": {
                "acc_norm": "0.81",
                "acc_norm,stderr": "0.02",
            },
            "arc_challenge": {
                "acc": "0.67",
                "acc,stderr": "0.04",
            },
        },
    },
    {
        "name": "testing-model-3",
        "endpoint": "https://api.testing-model-3.com",
        "api_key": "asdfassdafdsdafsad",
        "description": "Seeded comparison model Gamma",
        "provider": "Mock",
        "benchmarks": {
            "mmlu": {
                "acc": "0.88",
                "acc,stderr": "0.01",
                "exact_match": "0.84",
                "exact_match,stderr": "0.02",
            },
            "arc_challenge": {
                "acc": "0.72",
                "acc,stderr": "0.03",
            },
        },
    },
]


def get_or_create_model(session: Session, seed_model: dict) -> LLMModel:
    statement = select(LLMModel).where(LLMModel.endpoint == seed_model["endpoint"])
    model = session.exec(statement).first()

    if model is not None:
        model.description = seed_model["description"]
        model.provider = seed_model["provider"]
        session.add(model)
        session.commit()
        session.refresh(model)
        return model

    model = LLMModel(
        name=seed_model["name"],
        endpoint=seed_model["endpoint"],
        api_key=seed_model["api_key"],
        description=seed_model["description"],
        provider=seed_model["provider"],
    )
    session.add(model)
    session.commit()
    session.refresh(model)
    return model


def create_completed_evaluation(
    session: Session,
    model: LLMModel,
    benchmark_results: dict[str, dict[str, str]],
    offset_minutes: int,
) -> EvaluationModel:
    completed_at = utc_now() - timedelta(minutes=offset_minutes)
    started_at = completed_at - timedelta(minutes=12 + offset_minutes)
    duration = (completed_at - started_at).total_seconds()

    evaluation = EvaluationModel(
        llm_id=model.id,
        status=EvaluationStatus.COMPLETED,
        metadata_entry=EvaluationMetadata(
            started_at=started_at,
            completed_at=completed_at,
            duration=duration,
            progress=100.0,
        ),
        benchmarks=[
            BenchmarkModel(
                name=benchmark_name,
                description=f"Seeded {benchmark_name} benchmark",
                status=EvaluationStatus.COMPLETED,
                effective_sample_count=100,
                metrics=build_metric_models(results),
            )
            for benchmark_name, results in benchmark_results.items()
        ],
    )

    session.add(evaluation)
    session.commit()
    session.refresh(evaluation)
    return evaluation


def build_metric_models(results: dict[str, str]) -> list[MetricModel]:
    metrics = []

    for metric_name, value in results.items():
        if metric_name.endswith(",stderr"):
            continue

        metrics.append(
            MetricModel(
                name=metric_name,
                value=float(value),
                stderr=to_optional_float(results.get(f"{metric_name},stderr")),
            )
        )

    return metrics


def to_optional_float(value: str | None) -> float | None:
    return float(value) if value is not None else None


def main() -> None:
    SQLModel.metadata.create_all(engine)
    seeded_payload = []

    with Session(engine) as session:
        for index, seed_model in enumerate(SEEDED_MODELS):
            model = get_or_create_model(session, seed_model)
            evaluation = create_completed_evaluation(
                session=session,
                model=model,
                benchmark_results=seed_model["benchmarks"],
                offset_minutes=index,
            )
            seeded_payload.append(
                {
                    "model_id": str(model.id),
                    "endpoint": model.endpoint,
                    "evaluation_id": str(evaluation.id),
                }
            )

    print(json.dumps({"seeded": seeded_payload}, indent=2))
    print()
    print("Use these model_ids in POST /comparisons:")
    print(
        json.dumps(
            {"model_ids": [item["model_id"] for item in seeded_payload]},
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
