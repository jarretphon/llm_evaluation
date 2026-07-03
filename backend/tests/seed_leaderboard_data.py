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
from app.domains.evaluations.traversal import get_root_groups
from app.domains.llms.models import LLMModel
from lm_eval.tasks import TaskManager
from sqlmodel import Session, SQLModel, select

STATUS_ROTATION = [
    EvaluationStatus.FAILED,
    EvaluationStatus.PARTIAL_FAILED,
    EvaluationStatus.RUNNING,
    EvaluationStatus.QUEUED,
]

COMMON_BENCHMARK_COUNT = 3
OPTIONAL_BENCHMARK_COUNT = 7


def get_or_create_model(session: Session, index: int) -> LLMModel:
    endpoint = f"https://leaderboard-seed-{index}.example.com"
    model = session.exec(
        select(LLMModel).where(LLMModel.endpoint == endpoint)
    ).first()

    if model is None:
        model = LLMModel(
            name=f"leaderboard-seed-model-{index}",
            endpoint=endpoint,
            api_key="seed-api-key",
            description=f"Seeded leaderboard model {index}",
            provider="Seed",
        )
    else:
        model.name = f"leaderboard-seed-model-{index}"
        model.description = f"Seeded leaderboard model {index}"
        model.provider = "Seed"

    session.add(model)
    session.commit()
    session.refresh(model)
    return model


def delete_existing_seed_evaluations(session: Session, model: LLMModel) -> None:
    evaluations = session.exec(
        select(EvaluationModel).where(EvaluationModel.llm_id == model.id)
    ).all()

    for evaluation in evaluations:
        session.delete(evaluation)

    session.commit()


def create_evaluation(
    session: Session,
    model: LLMModel,
    status: EvaluationStatus,
    benchmark_names: list[str],
    model_index: int,
    offset_minutes: int,
) -> EvaluationModel:
    completed_at = None
    progress = 0.0
    duration = 0.0

    if status == EvaluationStatus.COMPLETED:
        completed_at = utc_now() - timedelta(minutes=offset_minutes)
        progress = 100.0
        duration = 600.0 + (model_index * 15)
    elif status == EvaluationStatus.PARTIAL_FAILED:
        completed_at = utc_now() - timedelta(minutes=offset_minutes)
        progress = 100.0
        duration = 480.0 + (model_index * 12)
    elif status == EvaluationStatus.FAILED:
        completed_at = utc_now() - timedelta(minutes=offset_minutes)
        progress = 100.0
        duration = 180.0 + (model_index * 8)
    elif status == EvaluationStatus.RUNNING:
        progress = 40.0 + model_index

    started_at = utc_now() - timedelta(minutes=offset_minutes + 20)

    evaluation = EvaluationModel(
        llm_id=model.id,
        status=status,
        metadata_entry=EvaluationMetadata(
            started_at=started_at,
            completed_at=completed_at,
            duration=duration,
            progress=progress,
        ),
        benchmarks=[
            build_benchmark(
                benchmark_name=benchmark_name,
                evaluation_status=status,
                model_index=model_index,
                benchmark_index=benchmark_index,
            )
            for benchmark_index, benchmark_name in enumerate(benchmark_names)
        ],
    )

    session.add(evaluation)
    session.commit()
    session.refresh(evaluation)
    return evaluation


def build_benchmark(
    benchmark_name: str,
    evaluation_status: EvaluationStatus,
    model_index: int,
    benchmark_index: int,
) -> BenchmarkModel:
    benchmark_status = (
        EvaluationStatus.COMPLETED
        if evaluation_status == EvaluationStatus.COMPLETED
        else evaluation_status
    )
    n_samples = 80 + (model_index * 7) + (benchmark_index * 11)

    return BenchmarkModel(
        name=benchmark_name,
        description=f"Seeded {benchmark_name} benchmark",
        status=benchmark_status,
        n_samples=n_samples if benchmark_status == EvaluationStatus.COMPLETED else 0,
        metrics=build_metric_models(model_index, benchmark_index, benchmark_status),
    )


def build_metric_models(
    model_index: int,
    benchmark_index: int,
    benchmark_status: EvaluationStatus,
) -> list[MetricModel]:
    if benchmark_status != EvaluationStatus.COMPLETED:
        return []

    base_score = 0.52 + (model_index * 0.025) + (benchmark_index * 0.013)
    score = min(base_score, 0.94)

    if benchmark_index % 3 == 0:
        return [
            MetricModel(name="acc", value=round(score, 5)),
            MetricModel(name="exact_match", value=round(score - 0.03, 5)),
        ]

    if benchmark_index % 3 == 1:
        return [MetricModel(name="acc_norm", value=round(score, 5))]

    return [MetricModel(name="exact_match", value=round(score, 5))]


def get_selectable_benchmarks() -> tuple[dict[str, list[str]], list[str]]:
    grouped_benchmarks = get_root_groups(TaskManager())
    benchmark_names = [
        benchmark
        for benchmarks in grouped_benchmarks.values()
        for benchmark in benchmarks
    ]

    return grouped_benchmarks, list(dict.fromkeys(benchmark_names))


def split_seed_benchmarks(
    selectable_benchmarks: list[str],
) -> tuple[list[str], list[str]]:
    required_count = COMMON_BENCHMARK_COUNT + OPTIONAL_BENCHMARK_COUNT
    if len(selectable_benchmarks) < required_count:
        raise ValueError(
            "Not enough selectable high-level benchmarks to seed leaderboard data. "
            f"Need {required_count}, found {len(selectable_benchmarks)}."
        )

    common_benchmarks = selectable_benchmarks[:COMMON_BENCHMARK_COUNT]
    optional_benchmarks = selectable_benchmarks[
        COMMON_BENCHMARK_COUNT:required_count
    ]
    return common_benchmarks, optional_benchmarks


def completed_benchmarks_for_model(
    index: int, common_benchmarks: list[str], optional_benchmarks: list[str]
) -> list[str]:
    extra_count = 2 + (index % 6)
    return common_benchmarks + optional_benchmarks[:extra_count]


def side_benchmarks_for_model(
    index: int, common_benchmarks: list[str], optional_benchmarks: list[str]
) -> list[str]:
    extra_count = 2 + ((index + 2) % 4)
    return common_benchmarks[:2] + optional_benchmarks[-extra_count:]


def main() -> None:
    SQLModel.metadata.create_all(engine)
    grouped_benchmarks, selectable_benchmarks = get_selectable_benchmarks()
    common_seed_benchmarks, optional_seed_benchmarks = split_seed_benchmarks(
        selectable_benchmarks
    )
    seeded_models = []
    latest_completed_benchmark_sets = []

    with Session(engine) as session:
        for index in range(1, 11):
            model = get_or_create_model(session, index)
            delete_existing_seed_evaluations(session, model)

            completed_benchmarks = completed_benchmarks_for_model(
                index, common_seed_benchmarks, optional_seed_benchmarks
            )
            older_completed_benchmarks = side_benchmarks_for_model(
                index, common_seed_benchmarks, optional_seed_benchmarks
            )
            non_completed_status = STATUS_ROTATION[(index - 1) % len(STATUS_ROTATION)]

            older_completed = create_evaluation(
                session=session,
                model=model,
                status=EvaluationStatus.COMPLETED,
                benchmark_names=older_completed_benchmarks,
                model_index=index,
                offset_minutes=900 + index,
            )
            latest_completed = create_evaluation(
                session=session,
                model=model,
                status=EvaluationStatus.COMPLETED,
                benchmark_names=completed_benchmarks,
                model_index=index,
                offset_minutes=100 + index,
            )
            non_completed = create_evaluation(
                session=session,
                model=model,
                status=non_completed_status,
                benchmark_names=completed_benchmarks[:5],
                model_index=index,
                offset_minutes=10 + index,
            )

            latest_completed_benchmark_sets.append(set(completed_benchmarks))
            seeded_models.append(
                {
                    "model_id": str(model.id),
                    "model_name": model.name,
                    "latest_completed_evaluation_id": str(latest_completed.id),
                    "older_completed_evaluation_id": str(older_completed.id),
                    "non_completed_evaluation_id": str(non_completed.id),
                    "non_completed_status": non_completed.status,
                    "latest_completed_benchmarks": completed_benchmarks,
                }
            )

    common_benchmarks = sorted(set.intersection(*latest_completed_benchmark_sets))
    total_benchmarks = sorted(set.union(*latest_completed_benchmark_sets))

    print("Selectable high-level benchmark groups used by the UI:")
    print(json.dumps(grouped_benchmarks, indent=2))
    print()
    print(json.dumps({"seeded_models": seeded_models}, indent=2))
    print()
    print("Common benchmarks across all latest completed evaluations:")
    print(json.dumps(common_benchmarks, indent=2))
    print()
    print("Total benchmark set used across latest completed evaluations:")
    print(json.dumps(total_benchmarks, indent=2))


if __name__ == "__main__":
    main()
