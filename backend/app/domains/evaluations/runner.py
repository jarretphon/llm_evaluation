import lm_eval
from app.domains.evaluations.utils import require_completions
from lm_eval.tasks import TaskManager


def run_lm_eval(
    base_url: str, model_name: str, task: str, task_manager: TaskManager
) -> dict:
    model_args = {
        "model": model_name,
        "base_url": base_url,
    }

    if require_completions(task, task_manager):
        results = lm_eval.simple_evaluate(
            model="local-completions",
            model_args=model_args,
            tasks=[task],
        )
    else:
        results = lm_eval.simple_evaluate(
            model="local-chat-completions",
            model_args=model_args,
            tasks=[task],
            apply_chat_template=True,
        )
    return results
