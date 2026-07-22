from collections.abc import Callable
from datetime import UTC, datetime

from app.domains.comparisons.repository import ComparisonRepository
from app.domains.evaluations.models import EvaluationModel, EvaluationStatus
from app.domains.llms.models import LLMModel


def test_get_models_by_ids_returns_requested_existing_models(
    comparison_repository: ComparisonRepository,
    seed_llm: Callable[..., LLMModel],
) -> None:
    first_model = seed_llm(name="Requested Model")
    missing_model = seed_llm(name="Unrequested Model")

    models = comparison_repository.get_models_by_ids([first_model.id])

    assert models == [first_model]
    assert missing_model not in models
    assert comparison_repository.get_models_by_ids([]) == []


def test_get_latest_evaluation_metrics_uses_latest_completed_evaluation(
    comparison_repository: ComparisonRepository,
    comparison_seed_data: tuple[LLMModel, LLMModel],
) -> None:
    first_model, second_model = comparison_seed_data

    rows = comparison_repository.get_latest_evaluation_metrics(
        [first_model.id, second_model.id]
    )

    assert rows == [
        (first_model.id, first_model.name, "gsm8k", "exact_match", 0.64),
        (second_model.id, second_model.name, "hellaswag", "acc_norm", 0.74),
        (second_model.id, second_model.name, "mmlu", "acc", 0.91),
        (first_model.id, first_model.name, "mmlu", "acc", 0.82),
        (first_model.id, first_model.name, "mmlu", "exact_match", 0.78),
    ]


def test_get_latest_evaluation_metrics_returns_empty_for_models_without_completed_evaluations(
    comparison_repository: ComparisonRepository,
    seed_llm: Callable[..., LLMModel],
    seed_completed_evaluation: Callable[..., EvaluationModel],
) -> None:
    model = seed_llm(name="Running Only Model")
    seed_completed_evaluation(
        llm=model,
        completed_at=datetime.now(UTC),
        status=EvaluationStatus.RUNNING,
        benchmark_metrics={"mmlu": {"acc": 0.95}},
    )

    rows = comparison_repository.get_latest_evaluation_metrics([model.id])

    assert rows == []
