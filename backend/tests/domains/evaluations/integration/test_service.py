from collections.abc import Callable

from app.domains.evaluations import service as evaluation_service_module
from app.domains.evaluations.models import (
    BenchmarkModel,
    EvaluationModel,
    EvaluationStatus,
)
from app.domains.evaluations.repository import EvaluationRepository
from app.domains.evaluations.service import EvaluationService


def test_run_registered_evaluation_completes_successfully(
    evaluation_repository: EvaluationRepository,
    seed_evaluation: Callable[..., EvaluationModel],
    make_lm_eval_result: Callable[..., dict],
    mocker,
) -> None:
    evaluation = seed_evaluation(benchmarks=[BenchmarkModel(name="mmlu")])
    service = EvaluationService(evaluation_repository)
    task_manager = object()
    run_lm_eval = mocker.patch.object(
        evaluation_service_module,
        "run_lm_eval",
        side_effect=[
            make_lm_eval_result("task_a", acc=0.5, effective_samples=10),
            make_lm_eval_result("task_b", acc=1.0, effective_samples=30),
        ],
    )
    mocker.patch.object(service, "get_task_manager", return_value=task_manager)
    mocker.patch.object(service, "get_subtasks", return_value=["task_a", "task_b"])
    broadcast_update = mocker.patch.object(service, "broadcast_update")

    result = service.run_registered_evaluation(evaluation.id)
    updated_evaluation = evaluation_repository.get_by_id(evaluation.id)

    assert result.id == evaluation.id
    assert updated_evaluation is not None
    assert updated_evaluation.status == EvaluationStatus.COMPLETED
    assert updated_evaluation.progress == 100.0
    assert updated_evaluation.metadata_entry.completed_at is not None
    assert updated_evaluation.metadata_entry.duration >= 0

    benchmark = updated_evaluation.benchmarks[0]
    assert benchmark.status == EvaluationStatus.COMPLETED
    assert benchmark.effective_sample_count == 40
    assert {metric.name: metric.value for metric in benchmark.metrics} == {"acc": 0.875}

    assert run_lm_eval.call_count == 2
    run_lm_eval.assert_any_call(
        base_url=updated_evaluation.llm_entry.endpoint,
        model_name=updated_evaluation.llm_entry.name,
        task="task_a",
        task_manager=task_manager,
    )
    run_lm_eval.assert_any_call(
        base_url=updated_evaluation.llm_entry.endpoint,
        model_name=updated_evaluation.llm_entry.name,
        task="task_b",
        task_manager=task_manager,
    )
    assert broadcast_update.call_count == 5


def test_run_registered_evaluation_marks_evaluation_failed_when_all_tasks_fail(
    evaluation_repository: EvaluationRepository,
    seed_evaluation: Callable[..., EvaluationModel],
    mocker,
) -> None:
    evaluation = seed_evaluation(benchmarks=[BenchmarkModel(name="mmlu")])
    service = EvaluationService(evaluation_repository)
    run_lm_eval = mocker.patch.object(
        evaluation_service_module,
        "run_lm_eval",
        side_effect=RuntimeError("lm_eval failed"),
    )
    mocker.patch.object(service, "get_task_manager", return_value=object())
    mocker.patch.object(service, "get_subtasks", return_value=["task_a", "task_b"])
    broadcast_update = mocker.patch.object(service, "broadcast_update")

    result = service.run_registered_evaluation(evaluation.id)
    updated_evaluation = evaluation_repository.get_by_id(evaluation.id)

    assert result.id == evaluation.id
    assert updated_evaluation is not None
    assert updated_evaluation.status == EvaluationStatus.FAILED
    assert updated_evaluation.progress == 100.0
    assert updated_evaluation.metadata_entry.completed_at is not None

    benchmark = updated_evaluation.benchmarks[0]
    assert benchmark.status == EvaluationStatus.FAILED
    assert benchmark.effective_sample_count == 0
    assert benchmark.metrics == []

    assert run_lm_eval.call_count == 2
    assert broadcast_update.call_count == 5
