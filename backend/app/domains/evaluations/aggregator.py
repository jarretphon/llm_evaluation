from app.domains.evaluations.models import EvaluationStatus, MetricModel


def aggregate_results(results: dict[str, dict]) -> tuple[EvaluationStatus, dict]:
    any_failed = any(result["error"] for result in results.values())
    all_failed = all(result["error"] for result in results.values())

    if all_failed:
        status = EvaluationStatus.FAILED
    elif any_failed:
        status = EvaluationStatus.PARTIAL_FAILED
    else:
        status = EvaluationStatus.COMPLETED

    aggregate_results = {
        "total_effective_sample_count": 0,
        "results": {},
    }

    # Get weighted average for each metric across all tasks, weighted by effective sample count
    # Weighted average = sum(value * weight) / sum(weight)
    for task_result in results.values():
        if task_result["error"]:
            continue

        sample_count = task_result.get("effective_sample_count", 0)
        aggregate_results["total_effective_sample_count"] += sample_count

        if sample_count <= 0:
            continue

        for metric_name, metric_value in task_result["results"].items():
            aggregate_results["results"][metric_name] = (
                aggregate_results["results"].get(metric_name, 0.0)
                + metric_value * sample_count
            )

    total_count = aggregate_results["total_effective_sample_count"]
    for metric_name, metric_value in aggregate_results["results"].items():
        aggregate_results["results"][metric_name] = round(metric_value / total_count, 5)

    return status, aggregate_results


def build_benchmark_metrics(aggregate_results: dict[str, float]) -> list[MetricModel]:
    metrics = []

    for metric_name, metric_value in aggregate_results.items():
        if metric_value is None:
            continue

        metrics.append(
            MetricModel(
                name=metric_name,
                value=metric_value,
            )
        )

    return metrics
