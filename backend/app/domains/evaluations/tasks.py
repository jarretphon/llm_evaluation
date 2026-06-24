from typing import Any

from lm_eval.tasks import TaskManager
from lm_eval.tasks._index import Kind


def get_root_names(task_manager: TaskManager) -> tuple[set[str], set[str], set[str]]:
    referenced_groups = set()
    referenced_tags = set()
    referenced_subtasks = set()

    names = [*task_manager.all_groups, *task_manager.all_tags]

    for name in names:
        entry = task_manager.task_index[name]
        entry_roots = _get_entry_roots(entry, task_manager)

        groups, tags, subtasks = get_substructure(entry, task_manager)

        referenced_groups.update(
            group
            for group in groups
            if _shares_task_root(
                entry_roots,
                task_manager.task_index.get(group),
                task_manager,
            )
        )
        referenced_tags.update(
            tag
            for tag in tags
            if _shares_task_root(
                entry_roots,
                task_manager.task_index.get(tag),
                task_manager,
            )
        )
        referenced_subtasks.update(subtasks)

    referenced_tags.update(_get_subset_tags(task_manager))
    referenced_tags.update(_get_duplicate_alias_tags(task_manager))

    root_groups = set(task_manager.all_groups) - referenced_groups
    root_tags = set(task_manager.all_tags) - referenced_tags
    standalone_tasks = set(task_manager.all_subtasks) - referenced_subtasks

    return root_groups, root_tags, standalone_tasks


def get_substructure(
    entry: Any, task_manager: TaskManager
) -> tuple[set[str], set[str], set[str]]:
    groups = set()
    tags = set()
    sub_tasks = set()

    if entry.kind == Kind.GROUP:
        _collect_from_task_field(
            entry.cfg.get("task", []) if entry.cfg else [],
            task_manager,
            groups,
            tags,
            sub_tasks,
            seen={entry.name},
        )

    elif entry.kind == Kind.TAG:
        for item in entry.tags:
            _collect_from_name(
                item,
                task_manager,
                groups,
                tags,
                sub_tasks,
                seen={entry.name},
            )

    return groups, tags, sub_tasks


def _shares_task_root(
    parent_roots: set[str],
    child_entry: Any,
    task_manager: TaskManager,
) -> bool:
    if not parent_roots or child_entry is None:
        return False

    child_roots = _get_entry_roots(child_entry, task_manager)
    return bool(parent_roots & child_roots)


def _get_entry_roots(entry: Any, task_manager: TaskManager) -> set[str]:
    if entry is None:
        return set()

    if entry.yaml_path:
        return {_get_task_root_from_yaml_path(entry.yaml_path)}

    if entry.kind == Kind.TAG:
        roots = set()
        for task_name in entry.tags:
            task_entry = task_manager.task_index.get(task_name)
            if task_entry and task_entry.yaml_path:
                roots.add(_get_task_root_from_yaml_path(task_entry.yaml_path))
        return roots

    return set()


def _get_task_root_from_yaml_path(yaml_path: Any) -> str:
    parts = yaml_path.parts

    for index in range(len(parts) - 2, -1, -1):
        if parts[index] == "tasks":
            return parts[index + 1]

    return yaml_path.parent.name


def _get_subset_tags(task_manager: TaskManager) -> set[str]:
    tag_task_sets: dict[str, set[str]] = {}
    tag_roots: dict[str, set[str]] = {}

    for tag_name in task_manager.all_tags:
        entry = task_manager.task_index[tag_name]
        tag_task_sets[tag_name] = set(entry.tags)
        tag_roots[tag_name] = _get_entry_roots(entry, task_manager)

    subset_tags = set()
    tag_names = list(tag_task_sets)

    for tag_name in tag_names:
        task_names = tag_task_sets[tag_name]
        roots = tag_roots[tag_name]

        if not task_names or not roots:
            continue

        for other_tag_name in tag_names:
            if tag_name == other_tag_name:
                continue

            other_task_names = tag_task_sets[other_tag_name]
            other_roots = tag_roots[other_tag_name]

            if roots == other_roots and task_names < other_task_names:
                subset_tags.add(tag_name)
                break

    return subset_tags


def _get_duplicate_alias_tags(task_manager: TaskManager) -> set[str]:
    buckets: dict[tuple[frozenset[str], frozenset[str]], list[str]] = {}

    for tag_name in task_manager.all_tags:
        entry = task_manager.task_index[tag_name]
        key = (
            frozenset(_get_entry_roots(entry, task_manager)),
            frozenset(entry.tags),
        )
        buckets.setdefault(key, []).append(tag_name)

    alias_tags = set()

    for (roots, task_names), tag_names in buckets.items():
        if len(tag_names) <= 1 or not roots or not task_names:
            continue

        preferred_tags = [
            tag_name
            for tag_name in tag_names
            if any(
                _normalise_name(root_name) in _normalise_name(tag_name)
                for root_name in roots
            )
        ]

        if preferred_tags:
            alias_tags.update(set(tag_names) - set(preferred_tags))

    return alias_tags


def _normalise_name(name: str) -> str:
    return "".join(character for character in name.lower() if character.isalnum())


def _collect_from_name(
    name: str,
    task_manager: TaskManager,
    groups: set[str],
    tags: set[str],
    sub_tasks: set[str],
    seen: set[str],
) -> None:
    if name in seen:
        return

    entry = task_manager.task_index.get(name)
    if entry is None:
        return

    next_seen = {*seen, name}

    if entry.kind == Kind.GROUP:
        groups.add(name)
        _collect_from_task_field(
            entry.cfg.get("task", []) if entry.cfg else [],
            task_manager,
            groups,
            tags,
            sub_tasks,
            seen=next_seen,
        )
        return

    if entry.kind == Kind.TAG:
        tags.add(name)
        for item in entry.tags:
            _collect_from_name(
                item,
                task_manager,
                groups,
                tags,
                sub_tasks,
                seen=next_seen,
            )
        return

    if entry.kind in {Kind.TASK, Kind.PY_TASK}:
        sub_tasks.add(name)


def _collect_from_task_field(
    task_field: Any,
    task_manager: TaskManager,
    groups: set[str],
    tags: set[str],
    sub_tasks: set[str],
    seen: set[str],
) -> None:
    if not task_field:
        return

    if isinstance(task_field, str):
        _collect_from_name(
            task_field,
            task_manager,
            groups,
            tags,
            sub_tasks,
            seen,
        )
        return

    if isinstance(task_field, list):
        for item in task_field:
            _collect_from_task_field(
                item,
                task_manager,
                groups,
                tags,
                sub_tasks,
                seen,
            )
        return

    if isinstance(task_field, dict):
        group_name = task_field.get("group")
        task_name = task_field.get("task")

        if isinstance(group_name, str):
            _collect_from_name(
                group_name,
                task_manager,
                groups,
                tags,
                sub_tasks,
                seen,
            )

        _collect_from_task_field(
            task_name,
            task_manager,
            groups,
            tags,
            sub_tasks,
            seen,
        )


# Entry(name='afrimgsm-irokobench', kind=<Kind.GROUP: 3>, yaml_path=PosixPath('/home/jarretphon/intern/llm-evaluation/backend/.venv/lib/python3.14/site-packages/lm_eval/tasks/afrimgsm/direct/afrimgsm.yaml'),
# cfg={'group': 'afrimgsm-irokobench',
# 'task': ['afrimgsm_tasks_prompt_1', 'afrimgsm_tasks_prompt_2', 'afrimgsm_tasks_prompt_3', 'afrimgsm_tasks_prompt_4', 'afrimgsm_tasks_prompt_5'],
# 'aggregate_metric_list': [{'metric': 'acc', 'aggregation': 'mean', 'weight_by_size': True}], 'metadata': {'version': 2}}, tags=set())

# Entry(name='mmlu_stem_tasks', kind=<Kind.TAG: 4>, yaml_path=None,
# cfg=None, tags={'mmlu_computer_security', 'mmlu_high_school_biology', 'mmlu_college_physics', 'mmlu_high_school_mathematics', 'mmlu_college_computer_science', 'mmlu_high_school_computer_science', 'mmlu_conceptual_physics', 'mmlu_high_school_physics', 'mmlu_high_school_statistics', 'mmlu_college_mathematics', 'mmlu_abstract_algebra', 'mmlu_machine_learning', 'mmlu_electrical_engineering', 'mmlu_astronomy', 'mmlu_elementary_mathematics', 'mmlu_college_biology', 'mmlu_college_chemistry', 'mmlu_high_school_chemistry', 'mmlu_anatomy'})

# Entry(name='mmlu_college_mathematics', kind=<Kind.TASK: 1>, yaml_path=PosixPath('/home/jarretphon/intern/llm-evaluation/backend/.venv/lib/python3.14/site-packages/lm_eval/tasks/mmlu/default/mmlu_college_mathematics.yaml'),
# cfg={'dataset_path': 'cais/mmlu', 'test_split': 'test', 'fewshot_split': 'dev', 'fewshot_config': {'sampler': 'first_n'}, 'output_type': 'multiple_choice', 'doc_to_text': '{{question.strip()}}\nA. {{choices[0]}}\nB. {{choices[1]}}\nC. {{choices[2]}}\nD. {{choices[3]}}\nAnswer:', 'doc_to_choice': ['A', 'B', 'C', 'D'], 'doc_to_target': 'answer', 'metric_list': [{'metric': 'acc', 'aggregation': 'mean', 'higher_is_better': True}], 'metadata': {'version': 1.0}, 'dataset_name': 'college_mathematics', 'description': 'The following are multiple choice questions (with answers) about college mathematics.\n\n', 'tag': 'mmlu_stem_tasks', 'task': 'mmlu_college_mathematics', 'task_alias': 'college_mathematics'}, tags={'mmlu_stem_tasks'})

root_groups, root_tags, standalone_tasks = get_root_names(TaskManager())

print("Root Groups:", sorted(root_groups))
print("Root Tags:", sorted(root_tags))
print("Standalone Tasks:", sorted(standalone_tasks))
