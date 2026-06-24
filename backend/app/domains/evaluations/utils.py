from lm_eval.tasks import TaskManager
from lm_eval.tasks.manager import Kind

OUTPUT_TYPES = [
    "multiple_choice",
    "loglikelihood_rolling",
    "loglikelihood",
    "generate_until",
]
COMPLETIONS_TYPES = ["multiple_choice", "loglikelihood_rolling", "loglikelihood"]

task_manager = TaskManager()
hella_swag = "hellaswag"
mmlu = "mmlu"

task_config = task_manager.task_index["mmlu_stem_tasks"]

# print(task_config)


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


# def get_group_tasks(group_name: str, task_manager: TaskManager) -> list[str]:
#     """Recursively get leaf tasks for a given group."""

#     index = task_manager.task_index

#     if group_name not in index:
#         return []

#     entry = index[group_name]

#     if entry.kind == Kind.TASK:
#         return [group_name]

#     else:
#         sub_tasks = []

#         if entry.kind == Kind.GROUP:
#             group_items = entry.cfg.get("task", [])

#         elif entry.kind == Kind.TAG:
#             group_items = entry.tags

#         for item in group_items:
#             sub_tasks.extend(get_group_tasks(item, task_manager))

#         return sub_tasks


# def get_group_tasks(group_name: str, task_manager: TaskManager) -> list[str]:
#     """Recursively get leaf tasks for a given group, handling nested inline group dictionaries."""

#     index = task_manager.task_index

#     # 1. Base Case: Handle safe exits for missing tasks/groups
#     if group_name not in index:
#         return []

#     entry = index[group_name]

#     # 2. Base Case: If it is a leaf task, return its name immediately
#     if entry.kind == Kind.TASK:
#         return [group_name]

#     sub_tasks = []
#     group_items = []

#     # 3. Extract items from standard groups
#     if entry.kind == Kind.GROUP:
#         tasks_field = entry.cfg.get("task", [])
#         # Ensure it's a list (handles single-string edge cases)
#         group_items = tasks_field if isinstance(tasks_field, list) else [tasks_field]

#     # 4. Extract items from tag-based groupings
#     elif entry.kind == Kind.TAG:
#         group_items = list(entry.tags)

#     # 5. Process every child item dynamically
#     for item in group_items:
#         # Scenario A: The child is an inline subgroup dictionary (like in blimp_nl)
#         if isinstance(item, dict):
#             # Extract the nested task/sub-group list inside this inline group config
#             nested_tasks = item.get("task", [])
#             nested_list = (
#                 nested_tasks if isinstance(nested_tasks, list) else [nested_tasks]
#             )    sub_tasks.extend(
#                         get_group_tasks(sub_item.get("task", ""), task_manager)
#                     )

#         # Scenario B: The child is a simple reference name string (like in afrimgsm-irokobench)
#         elif isinstance(item, str):
#             sub_tasks.extend(get_group_tasks(item, task_manager))

#     return sub_tasks


def _flatten_task_field(task_field, task_manager: "TaskManager") -> list[str]:
    """Recursively processes and flattens arbitrarily nested task fields (strings/dicts/lists)."""
    # Case 1: Empty or missing field
    if not task_field:
        return []

    # Case 2: A simple task or group reference string
    if isinstance(task_field, str):
        return get_group_tasks(task_field, task_manager)

    # Case 3: A configuration dictionary (handles inline subgroups at any depth)
    if isinstance(task_field, dict):
        nested_tasks = task_field.get("task", [])
        return _flatten_task_field(nested_tasks, task_manager)

    # Case 4: An iterable list of items (could mix strings and dictionaries)
    if isinstance(task_field, list):
        leaves = []
        for item in task_field:
            leaves.extend(_flatten_task_field(item, task_manager))
        return leaves

    return []


def get_group_tasks(group_name: str, task_manager: "TaskManager") -> list[str]:
    """Recursively get leaf tasks for a given group, handling infinite depth configurations."""
    index = task_manager.task_index

    # Base Case: Handle safe exits for missing tasks/groups
    if group_name not in index:
        return []

    entry = index[group_name]

    # Base Case: If it is a leaf task, return its name immediately
    if entry.kind == Kind.TASK:
        return [group_name]

    sub_tasks = []

    # Scenario A: Standard Group or Inline Macro Benchmark
    if entry.kind == Kind.GROUP:
        tasks_field = entry.cfg.get("task", []) if entry.cfg else []
        sub_tasks.extend(_flatten_task_field(tasks_field, task_manager))

    # Scenario B: Tag collections
    elif entry.kind == Kind.TAG:
        if hasattr(entry, "tags") and entry.tags:
            for tag_item in entry.tags:
                sub_tasks.extend(_flatten_task_field(tag_item, task_manager))

    return sub_tasks


def is_standalone_task(entry):

    if entry.kind != Kind.TASK:
        return False

    if entry.cfg.get("tag") is None:
        return False

    return entry.name == entry.cfg.get("task") and set(entry.cfg.get("tag")).issubset(
        set(OUTPUT_TYPES)
    )


# def get_standalone_tasks(task_manager: TaskManager) -> list[str]:
#     """Get all standalone tasks (not part of any group) from the task manager."""
#     standalone_tasks = []

#     for task_name, entry in task_manager.task_index.items():
#         if is_standalone_task(entry):
#             standalone_tasks.append(task_name)
#     return standalone_tasks


# def get_standalone_tasks(task_manager: TaskManager) -> list[str]:
#     """Get all standalone tasks (not part of any group) from the task manager."""
#     standalone_tasks = []

#     for task_name, entry in task_manager.task_index.items():
#         if is_standalone_task(entry):
#             standalone_tasks.append(task_name)

#     return standalone_tasks


def get_standalone_tasks(task_manager: TaskManager) -> list[str]:
    """Get all standalone tasks (not part of any group) from the task manager."""
    groups = task_manager.all_groups
    tags = task_manager.all_tags
    group_sub_tasks = []

    for group in groups:
        group_sub_tasks.extend(get_group_tasks(group, task_manager))

    for tag in tags:
        group_sub_tasks.extend(get_group_tasks(tag, task_manager))

    print(len(set(group_sub_tasks)))
    subtasks = task_manager.all_subtasks

    # get difference between subtasks and group_sub_tasks
    standalone_tasks = list(set(subtasks) - set(group_sub_tasks))

    return standalone_tasks


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


print(task_manager.task_index["afrimgsm-irokobench"])
print(task_manager.task_index["mmlu_stem_tasks"])
print(task_manager.task_index["mmlu_college_mathematics"])
