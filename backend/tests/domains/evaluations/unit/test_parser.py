from app.domains.evaluations.parser import (
    get_effective_sample_count,
    get_metric_value,
    get_task_metric_results,
)


def test_get_task_metric_results_extracts_configured_metrics() -> None:
    eval_results = {
        "results": {
            "toy_task": {
                "acc,none": 0.75,
                "acc_stderr,none": 0.03,
                "exact_match,none": 0.5,
            }
        },
        "configs": {
            "toy_task": {
                "metric_list": [
                    {"metric": "acc"},
                    {"metric": "exact_match"},
                ]
            }
        },
    }

    task_results = get_task_metric_results(eval_results, "toy_task")

    assert task_results == {
        "acc": 0.75,
        "exact_match": 0.5,
    }


def test_get_task_metric_results_falls_back_to_single_task_result() -> None:
    eval_results = {
        "results": {
            "actual_task_name": {
                "acc,none": 0.9,
            }
        },
        "configs": {
            "actual_task_name": {
                "metric_list": [
                    {"metric": "acc"},
                ]
            }
        },
    }

    task_results = get_task_metric_results(eval_results, "requested_task_name")

    assert task_results == {"acc": 0.9}


def test_get_metric_value_ignores_stderr_only_values() -> None:
    value = get_metric_value({"acc_stderr,none": 0.02}, "acc")

    assert value is None


def test_get_effective_sample_count_reads_task_sample_count() -> None:
    eval_results = {
        "n-samples": {
            "toy_task": {
                "original": 20,
                "effective": 12,
            }
        }
    }

    assert get_effective_sample_count(eval_results, "toy_task") == 12
