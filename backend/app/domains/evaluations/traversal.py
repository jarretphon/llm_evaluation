from __future__ import annotations

from collections.abc import Iterable
from pathlib import Path
from typing import Any, TypeAlias

from lm_eval.tasks import TaskManager
from lm_eval.tasks._index import Entry, Kind

TaskTree: TypeAlias = dict[str, "TaskTree | str"]



def build_complete_task_tree(
    task_manager: TaskManager | None = None,
    *,
    include_tags: bool = True,
) -> TaskTree:
    """Build a repository-shaped tree containing every indexed subtask.

    Explicit lm-eval group YAMLs define the primary hierarchy. Tags are expanded
    when those groups reference them, but tags are not automatically promoted to
    top-level roots. Any remaining leaf tasks from ``TaskManager.all_subtasks``
    are inserted by their YAML path under ``lm_eval/tasks``.
    """

    manager = task_manager or TaskManager()
    all_subtasks = set(manager.all_subtasks)
    tree = _build_explicit_group_tree(manager, include_tags=include_tags)
    tree = _filter_tree_to_leaf_set(tree, all_subtasks)
    missing_repository_tasks = _tasks_missing_from_repository_roots(
        tree,
        all_subtasks,
        manager,
    )
    _insert_tasks_by_repository_path(tree, missing_repository_tasks, manager)

    return tree


def get_standalone_tasks(
    task_manager: TaskManager | None = None,
    *,
    include_tags: bool = True,
) -> list[str]:
    """Return leaf tasks that are not reachable from any group or tag root."""

    manager = task_manager or TaskManager()
    roots: list[str] = list(manager.all_groups)
    if include_tags:
        roots.extend(manager.all_tags)

    claimed_tasks: set[str] = set()
    for root in roots:
        claimed_tasks.update(
            _leaf_task_names(root, manager, include_tags=include_tags, seen=set())
        )

    return sorted(set(manager.all_subtasks) - claimed_tasks)

def build_task_node(
    name: str,
    task_manager: TaskManager | None = None,
    *,
    include_tags: bool = True,
) -> TaskTree:
    """Build the tree rooted at one task, group, or tag name."""

    manager = task_manager or TaskManager()
    return _node_from_name(name, manager, include_tags=include_tags, seen=set())


def _build_explicit_group_tree(
    task_manager: TaskManager,
    *,
    include_tags: bool,
) -> TaskTree:
    tree: TaskTree = {}
    for group_name in get_root_groups(task_manager):
        group_node = build_task_node(
            group_name, task_manager, include_tags=include_tags
        )
        group_children = group_node.get(group_name)

        if isinstance(group_children, dict):
            _insert_group_at_repository_path(
                tree,
                group_name,
                group_children,
                task_manager,
            )
        else:
            tree.update(group_node)

    return tree


def get_root_groups(task_manager: TaskManager) -> list[str]:
    """Gets the highest-level groups in the repository, i.e. those that are not referenced by any other group."""
    referenced_groups: set[str] = set()

    for group in task_manager.all_groups:
        entry = task_manager.task_index[group]
        group_root = get_group_root(entry)

        for subtask in flatten(get_tasks(entry)):
            child_entry = task_manager.task_index.get(subtask)
            is_refrenced = child_entry and child_entry.kind == Kind.GROUP and get_group_root(child_entry) == group_root

            if is_refrenced:
                referenced_groups.add(subtask)

    return sorted(set(task_manager.all_groups) - referenced_groups)


def get_group_root(entry: Entry) -> str | None:
    """Parses yaml path to find the root group name for an entry. The root group is the first directory under the `tasks` directory in the lm_eval repository."""
    if not entry.yaml_path:
        return None

    rel_parts = _relative_task_path_parts(entry.yaml_path)
    if not rel_parts:
        return None

    return rel_parts[0]


def get_tasks(entry: Entry) -> Any:
    if not entry.cfg:
        return []
    return entry.cfg.get("task", [])


def flatten(task_field: Any) -> set[str]:
    if not task_field:
        return set()

    if isinstance(task_field, str):
        return {task_field}

    if isinstance(task_field, dict):
        names: set[str] = set()
        group_name = task_field.get("group")
        task_name = task_field.get("task")

        if isinstance(group_name, str):
            names.add(group_name)

        if isinstance(task_name, str):
            names.add(task_name)
        else:
            names.update(flatten(task_name))

        return names

    if isinstance(task_field, list):
        names: set[str] = set()
        for item in task_field:
            names.update(flatten(item))
        return names

    return set()

def _insert_group_at_repository_path(
    tree: TaskTree,
    group_name: str,
    group_children: TaskTree,
    task_manager: TaskManager,
) -> None:
    path_parts = _repository_group_path_parts(group_name, task_manager)

    if not path_parts or path_parts[0] == group_name:
        _merge_tree(tree, {group_name: group_children})
        return

    node = tree
    for part in path_parts:
        value = node.get(part)
        if not isinstance(value, dict):
            value = {}
            node[part] = value
        node = value

    _merge_tree(node, {group_name: group_children})


def _repository_group_path_parts(
    group_name: str,
    task_manager: TaskManager,
) -> list[str]:
    entry = task_manager.task_index.get(group_name)
    if not entry or not entry.yaml_path:
        return [group_name]

    rel_parts = _relative_task_path_parts(entry.yaml_path)
    if not rel_parts:
        return [group_name]

    return rel_parts


def _tasks_missing_from_repository_roots(
    tree: TaskTree,
    task_names: Iterable[str],
    task_manager: TaskManager,
) -> list[str]:
    missing_tasks: list[str] = []

    for task_name in sorted(task_names):
        path_parts = _repository_path_parts(task_name, task_manager)
        root = path_parts[0] if path_parts else task_name
        root_value = tree.get(root)

        if root_value == task_name:
            continue

        if isinstance(root_value, dict) and _tree_contains_leaf(root_value, task_name):
            continue

        missing_tasks.append(task_name)

    return missing_tasks


def _tree_contains_leaf(tree: TaskTree, leaf_name: str) -> bool:
    for key, value in tree.items():
        if isinstance(value, dict):
            if _tree_contains_leaf(value, leaf_name):
                return True
        elif key == leaf_name or value == leaf_name:
            return True

    return False


def _merge_tree(target: TaskTree, source: TaskTree) -> None:
    for key, value in source.items():
        existing = target.get(key)
        if isinstance(existing, dict) and isinstance(value, dict):
            _merge_tree(existing, value)
        else:
            target[key] = value


def _node_from_name(
    name: str,
    task_manager: TaskManager,
    *,
    include_tags: bool,
    seen: set[str],
) -> TaskTree:
    entry = task_manager.task_index.get(name)

    if entry is None or _is_leaf(entry):
        return {name: name}

    if name in seen:
        return {name: name}

    next_seen = {*seen, name}

    if entry.kind == Kind.GROUP:
        return {
            name: _children_from_task_field(
                get_tasks(entry),
                task_manager,
                include_tags=include_tags,
                seen=next_seen,
            )
        }

    if include_tags and entry.kind == Kind.TAG:
        return {
            name: _children_from_names(
                sorted(entry.tags),
                task_manager,
                include_tags=include_tags,
                seen=next_seen,
            )
        }

    return {name: name}


def _children_from_task_field(
    task_field: Any,
    task_manager: TaskManager,
    *,
    include_tags: bool,
    seen: set[str],
) -> TaskTree:
    if not task_field:
        return {}

    if isinstance(task_field, str):
        return _node_from_name(
            task_field,
            task_manager,
            include_tags=include_tags,
            seen=seen,
        )

    if isinstance(task_field, dict):
        return _node_from_inline_config(
            task_field,
            task_manager,
            include_tags=include_tags,
            seen=seen,
        )

    if isinstance(task_field, list):
        children: TaskTree = {}
        for item in task_field:
            children.update(
                _children_from_task_field(
                    item,
                    task_manager,
                    include_tags=include_tags,
                    seen=seen,
                )
            )
        return children

    return {}


def _node_from_inline_config(
    config: dict[str, Any],
    task_manager: TaskManager,
    *,
    include_tags: bool,
    seen: set[str],
) -> TaskTree:
    group_name = config.get("group")

    if isinstance(group_name, str):
        return {
            group_name: _children_from_task_field(
                config.get("task", []),
                task_manager,
                include_tags=include_tags,
                seen={*seen, group_name},
            )
        }

    task_name = config.get("task")
    if isinstance(task_name, str):
        return _node_from_name(
            task_name,
            task_manager,
            include_tags=include_tags,
            seen=seen,
        )

    return _children_from_task_field(
        task_name,
        task_manager,
        include_tags=include_tags,
        seen=seen,
    )


def _children_from_names(
    names: Iterable[str],
    task_manager: TaskManager,
    *,
    include_tags: bool,
    seen: set[str],
) -> TaskTree:
    children: TaskTree = {}
    for name in names:
        children.update(
            _node_from_name(
                name,
                task_manager,
                include_tags=include_tags,
                seen=seen,
            )
        )
    return children


def _leaf_task_names(
    name: str,
    task_manager: TaskManager,
    *,
    include_tags: bool,
    seen: set[str],
) -> set[str]:
    entry = task_manager.task_index.get(name)

    if entry is None:
        return {name}

    if _is_leaf(entry):
        return {name}

    if name in seen:
        return set()

    next_seen = {*seen, name}

    if entry.kind == Kind.GROUP:
        return _leaf_names_from_task_field(
            get_tasks(entry),
            task_manager,
            include_tags=include_tags,
            seen=next_seen,
        )

    if include_tags and entry.kind == Kind.TAG:
        leaves: set[str] = set()
        for tag_item in entry.tags:
            leaves.update(
                _leaf_task_names(
                    tag_item,
                    task_manager,
                    include_tags=include_tags,
                    seen=next_seen,
                )
            )
        return leaves

    return set()


def _leaf_names_from_task_field(
    task_field: Any,
    task_manager: TaskManager,
    *,
    include_tags: bool,
    seen: set[str],
) -> set[str]:
    if not task_field:
        return set()

    if isinstance(task_field, str):
        return _leaf_task_names(
            task_field,
            task_manager,
            include_tags=include_tags,
            seen=seen,
        )

    if isinstance(task_field, dict):
        return _leaf_names_from_task_field(
            task_field.get("task", []),
            task_manager,
            include_tags=include_tags,
            seen=seen,
        )

    if isinstance(task_field, list):
        leaves: set[str] = set()
        for item in task_field:
            leaves.update(
                _leaf_names_from_task_field(
                    item,
                    task_manager,
                    include_tags=include_tags,
                    seen=seen,
                )
            )
        return leaves

    return set()


def _leaf_names_from_tree(tree: TaskTree) -> set[str]:
    leaves: set[str] = set()

    for key, value in tree.items():
        if isinstance(value, dict):
            leaves.update(_leaf_names_from_tree(value))
        else:
            leaves.add(value or key)

    return leaves


def _filter_tree_to_leaf_set(tree: TaskTree, allowed_leaves: set[str]) -> TaskTree:
    filtered: TaskTree = {}

    for key, value in tree.items():
        if isinstance(value, dict):
            child_tree = _filter_tree_to_leaf_set(value, allowed_leaves)
            if child_tree:
                filtered[key] = child_tree
        elif value in allowed_leaves:
            filtered[key] = value

    return filtered


def _insert_tasks_by_repository_path(
    tree: TaskTree,
    task_names: Iterable[str],
    task_manager: TaskManager,
) -> None:
    grouped_tasks: dict[str, list[str]] = {}

    for task_name in task_names:
        path_parts = _repository_path_parts(task_name, task_manager)
        root = path_parts[0] if path_parts else task_name
        grouped_tasks.setdefault(root, []).append(task_name)

    for task_names_for_root in grouped_tasks.values():
        for task_name in sorted(task_names_for_root):
            path_parts = _repository_path_parts(task_name, task_manager)
            if _should_insert_as_standalone_leaf(
                path_parts, task_name, task_names_for_root
            ):
                tree[task_name] = task_name
                continue

            _insert_task_at_path(tree, path_parts, task_name)


def _insert_task_at_path(tree: TaskTree, path_parts: list[str], task_name: str) -> None:
    if not path_parts:
        tree[task_name] = task_name
        return

    node = tree
    for part in path_parts:
        value = node.get(part)
        if not isinstance(value, dict):
            value = {}
            node[part] = value
        node = value

    node[task_name] = task_name


def _repository_path_parts(task_name: str, task_manager: TaskManager) -> list[str]:
    entry = task_manager.task_index.get(task_name)
    if not entry or not entry.yaml_path:
        return [task_name]

    rel_parts = _relative_task_path_parts(entry.yaml_path)
    if not rel_parts:
        return [task_name]

    return rel_parts


def _relative_task_path_parts(path: Path) -> list[str]:
    parts = path.parts

    for index in range(len(parts) - 2, -1, -1):
        if parts[index] == "tasks":
            return list(parts[index + 1 : -1])

    return list(path.parent.parts)


def _should_insert_as_standalone_leaf(
    path_parts: list[str],
    task_name: str,
    sibling_task_names: list[str],
) -> bool:
    return (
        len(sibling_task_names) == 1
        and len(path_parts) == 1
        and path_parts[0] == task_name
    )


def _is_leaf(entry: Entry) -> bool:
    return entry.kind in {Kind.TASK, Kind.PY_TASK}



# with open("task_tree2.json", "w") as f:
#     import json
#     json.dump(build_complete_task_tree(), f, indent=2)

# print(len(build_complete_task_tree()))

print(len(get_root_groups(TaskManager())))