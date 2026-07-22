from app.domains.evaluations.aggregator import (
    aggregate_results,
    build_benchmark_metrics,
)
from app.domains.evaluations.models import EvaluationStatus


def test_aggregate_results_uses_weighted_average_and_ignores_failed_tasks() -> None:
    status, aggregate_data = aggregate_results(
        {
            "task_a": {
                "error": False,
                "results": {"acc": 0.5, "exact_match": 0.2},
                "effective_sample_count": 2,
            },
            "task_b": {
                "error": False,
                "results": {"acc": 1.0, "exact_match": 0.8},
                "effective_sample_count": 6,
            },
            "task_c": {
                "error": True,
                "results": {"acc": 0.0, "exact_match": 0.0},
                "effective_sample_count": 100,
            },
        }
    )

    assert status == EvaluationStatus.PARTIAL_FAILED
    assert aggregate_data == {
        "total_effective_sample_count": 8,
        "results": {
            "acc": 0.875,
            "exact_match": 0.65,
        },
    }


def test_aggregate_results_returns_failed_when_all_tasks_fail() -> None:
    status, aggregate_data = aggregate_results(
        {
            "task_a": {
                "error": True,
                "results": {},
                "effective_sample_count": 0,
            },
            "task_b": {
                "error": True,
                "results": {},
                "effective_sample_count": 0,
            },
        }
    )

    assert status == EvaluationStatus.FAILED
    assert aggregate_data == {
        "total_effective_sample_count": 0,
        "results": {},
    }


def test_build_benchmark_metrics_skips_none_values() -> None:
    metrics = build_benchmark_metrics({"acc": 0.875, "mse": None})

    assert len(metrics) == 1
    assert metrics[0].name == "acc"
    assert metrics[0].value == 0.875
