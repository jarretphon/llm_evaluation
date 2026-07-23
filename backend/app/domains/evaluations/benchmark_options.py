from functools import lru_cache

from app.domains.evaluations.traversal import get_root_groups
from lm_eval.tasks import TaskManager


@lru_cache(maxsize=1)
def get_cached_benchmark_options() -> dict[str, list[str]]:
    return get_root_groups(TaskManager())
