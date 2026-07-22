def get_task_metric_results(eval_results: dict, task: str) -> dict:
    task_results = eval_results.get("results", {})
    results = task_results.get(task)

    if results is None and len(task_results) == 1:
        results = next(iter(task_results.values()))

    if not isinstance(results, dict):
        return {}

    task_metrics = {}
    for metric_name in get_metric_names(eval_results, task):
        value = get_metric_value(results, metric_name)
        if value is None:
            continue

        task_metrics[metric_name] = value

    return task_metrics


def get_metric_names(eval_results: dict, task: str) -> list[str]:
    config = eval_results.get("configs", {}).get(task)

    if config is None and len(eval_results.get("configs", {})) == 1:
        config = next(iter(eval_results["configs"].values()))

    metric_list = config.get("metric_list", []) if isinstance(config, dict) else []
    metric_names = []

    for metric_entry in metric_list:
        if not isinstance(metric_entry, dict):
            continue

        metric_name = metric_entry.get("metric")
        if isinstance(metric_name, str):
            metric_names.append(metric_name)

    return metric_names


def get_metric_value(results: dict, metric_name: str) -> float | None:
    value = get_first_existing_value(
        results,
        [
            metric_name,
            f"{metric_name},none",
        ],
    )

    if value is not None:
        return value

    for result_key, result_value in results.items():
        result_metric_name, is_stderr = parse_result_metric_key(result_key)
        if result_metric_name == metric_name and not is_stderr:
            return result_value

    return None


def parse_result_metric_key(metric_key: str) -> tuple[str, bool]:
    metric_name, _, suffix = metric_key.partition(",")

    if suffix == "stderr":
        return metric_name, True

    if metric_name.endswith("_stderr"):
        return metric_name.removesuffix("_stderr"), True

    return metric_name, False


def get_first_existing_value(values: dict, keys: list[str]):
    for key in keys:
        if key in values:
            return values[key]

    return None


def get_effective_sample_count(eval_results: dict, task: str) -> int:
    task_samples = eval_results.get("n-samples", {})
    sample_entry = task_samples.get(task)

    if sample_entry is None and len(task_samples) == 1:
        sample_entry = next(iter(task_samples.values()))

    if not isinstance(sample_entry, dict):
        return 0

    return sample_entry.get("effective")
