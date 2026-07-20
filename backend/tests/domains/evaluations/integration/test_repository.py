from collections.abc import Callable
from datetime import UTC, datetime

from app.domains.evaluations.models import (
    BenchmarkModel,
    EvaluationMetadata,
    EvaluationModel,
    EvaluationStatus,
    MetricModel,
)
from app.domains.evaluations.repository import EvaluationRepository
from app.domains.llms.models import LLMModel


def test_create_evaluation_persists_metadata_benchmarks_and_metrics(
    evaluation_repository: EvaluationRepository,
    seed_llm: Callable[..., LLMModel],
) -> None:
    llm = seed_llm(name="Repository Persisted Model")
    evaluation = EvaluationModel(
        llm_id=llm.id,
        metadata_entry=EvaluationMetadata(),
        benchmarks=[
            BenchmarkModel(
                name="mmlu",
                status=EvaluationStatus.COMPLETED,
                n_samples=25,
                metrics=[MetricModel(name="acc", value=0.82)],
            )
        ],
    )

    created_evaluation = evaluation_repository.create_evaluation(evaluation)
    persisted_evaluation = evaluation_repository.get_by_id(created_evaluation.id)

    assert persisted_evaluation is not None
    assert persisted_evaluation.id == created_evaluation.id
    assert persisted_evaluation.metadata_entry is not None
    assert len(persisted_evaluation.benchmarks) == 1
    assert persisted_evaluation.benchmarks[0].name == "mmlu"
    assert persisted_evaluation.benchmarks[0].effective_sample_count == 25
    assert persisted_evaluation.benchmarks[0].metrics[0].name == "acc"
    assert persisted_evaluation.benchmarks[0].metrics[0].value == 0.82


def test_list_evaluations_returns_rows_with_pagination(
    evaluation_repository: EvaluationRepository,
    seed_evaluation: Callable[..., EvaluationModel],
) -> None:
    first_evaluation = seed_evaluation(benchmarks=[BenchmarkModel(name="mmlu")])
    second_evaluation = seed_evaluation(benchmarks=[BenchmarkModel(name="gsm8k")])

    evaluations = evaluation_repository.list_evaluations(offset=1, limit=1)

    assert evaluations == [second_evaluation]
    assert first_evaluation not in evaluations


def test_update_evaluation_updates_status_and_progress(
    evaluation_repository: EvaluationRepository,
    seed_evaluation: Callable[..., EvaluationModel],
) -> None:
    evaluation = seed_evaluation(status=EvaluationStatus.QUEUED, progress=0.0)

    evaluation_repository.update_evaluation(
        evaluation,
        status=EvaluationStatus.RUNNING,
        progress=50.0,
    )
    evaluation_repository.save_evaluation(evaluation)
    updated_evaluation = evaluation_repository.get_by_id(evaluation.id)

    assert updated_evaluation is not None
    assert updated_evaluation.status == EvaluationStatus.RUNNING
    assert updated_evaluation.progress == 50.0


def test_update_evaluation_metadata_updates_completion_fields(
    evaluation_repository: EvaluationRepository,
    seed_evaluation: Callable[..., EvaluationModel],
) -> None:
    evaluation = seed_evaluation()
    completed_at = datetime.now(UTC)

    evaluation_repository.update_evaluation_metadata(
        evaluation.metadata_entry,
        completed_at=completed_at,
        duration=42.5,
    )
    evaluation_repository.save_evaluation(evaluation)
    updated_evaluation = evaluation_repository.get_by_id(evaluation.id)

    assert updated_evaluation is not None
    assert updated_evaluation.metadata_entry.completed_at == completed_at
    assert updated_evaluation.metadata_entry.duration == 42.5


def test_update_benchmark_updates_status_samples_and_metrics(
    evaluation_repository: EvaluationRepository,
    seed_evaluation: Callable[..., EvaluationModel],
) -> None:
    evaluation = seed_evaluation(benchmarks=[BenchmarkModel(name="mmlu")])
    benchmark = evaluation.benchmarks[0]

    evaluation_repository.update_benchmark(
        benchmark,
        status=EvaluationStatus.COMPLETED,
        n_samples=32,
        metrics=[
            MetricModel(name="acc", value=0.91),
            MetricModel(name="exact_match", value=0.73),
        ],
    )
    evaluation_repository.save_evaluation(evaluation)
    updated_evaluation = evaluation_repository.get_by_id(evaluation.id)

    assert updated_evaluation is not None
    updated_benchmark = updated_evaluation.benchmarks[0]
    assert updated_benchmark.status == EvaluationStatus.COMPLETED
    assert updated_benchmark.effective_sample_count == 32
    assert {metric.name: metric.value for metric in updated_benchmark.metrics} == {
        "acc": 0.91,
        "exact_match": 0.73,
    }
