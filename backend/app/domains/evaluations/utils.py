import lm_eval
from lm_eval.tasks import TaskManager
from lm_eval.tasks.manager import Kind
from lm_eval.api.task import Task
from lm_eval.api.group import Group

OUTPUT_TYPES = ["multiple_choice", "loglikelihood_rolling", "loglikelihood", "generate_until"]
COMPLETIONS_TYPES = ["multiple_choice", "loglikelihood_rolling", "loglikelihood"]

task_manager = TaskManager()
hella_swag = "hellaswag"
mmlu = "mmlu"

task_config = task_manager.task_index[hella_swag].kind

def is_task(task_name):
    task_entry = task_manager.task_index[task_name]
    return task_entry.kind == Kind.TASK

def is_group(task_name):
    task_entry = task_manager.task_index[task_name]
    return task_entry.kind == Kind.GROUP

def is_tag(task_name):
    task_entry = task_manager.task_index[task_name]
    return task_entry.kind == Kind.TAG

def require_completions(task_name):
    task_entry = task_manager.task_index[task_name]
    output_type = task_entry.cfg["output_type"]
    return output_type in COMPLETIONS_TYPES


def get_group_tasks(group_name: str, task_manager: TaskManager) -> list[str]:
    """Recursively get leaf tasks for a given group."""

    index = task_manager.task_index
    entry = index[group_name]

    if group_name not in index:
        return []
    
    if is_task(group_name):
        return [group_name]
    
    else:
        sub_tasks = []

        if is_group(group_name):
            group_items = entry.cfg.get("task", [])
        elif is_tag(group_name):
            group_items = entry.tags

        for item in group_items:
            sub_tasks.extend(get_group_tasks(item, task_manager))

        return sub_tasks
    

print(get_group_tasks("mmlu", task_manager))


# output_types = []
# for task_name, entry in task_manager.task_index.items():
#     # 1. Verify that 'cfg' actually exists and is a valid dictionary


#     if entry.cfg is not None:
#         tags = entry.cfg.get('output_type', None)
#         print(f"Task: {task_name}, output_type: {tags}, kind: {entry.kind}")
#         output_types.append(tags)
#     else:
#         # 2. Handles internal base-templates or unpopulated items safely
#         print(f"Task: {task_name}, output_type: [] (No configuration file loaded)")



# print(set(output_types))