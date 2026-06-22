from pathlib import Path

p = Path(
    "/home/jarretphon/intern/llm-evaluation/backend/.venv/lib/python3.14/site-packages/lm_eval/tasks/mmlu/default/_mmlu.yaml"
)


def _relative_task_path_parts(path: Path) -> list[str]:
    """Extracts the folder structure for an evaluation task"""
    for p in path.parents:
        if p.name != "tasks":
            continue

        subpath = path.parent.relative_to(p)
        return list(subpath.parts)


relative_parts = _relative_task_path_parts(p)
print(relative_parts)
