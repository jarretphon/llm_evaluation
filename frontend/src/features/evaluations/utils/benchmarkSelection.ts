import type { CheckboxState } from "@/features/evaluations/components/TriCheckbox"

export type BenchmarkTask = [name: string, subgroups: string[]]

export function getBenchmarkSelectionState(
  benchmark: BenchmarkTask,
  selectedItems: Set<string>
): CheckboxState {
  const [name, subgroups] = benchmark

  if (subgroups.length === 0) {
    return selectedItems.has(name) ? "checked" : "unchecked"
  }

  const selectedCount = subgroups.filter((group) =>
    selectedItems.has(group)
  ).length

  if (selectedCount === 0) {
    return "unchecked"
  }

  if (selectedCount === subgroups.length) {
    return "checked"
  }

  return "indeterminate"
}

export function toggleBenchmarkSelection(
  benchmark: BenchmarkTask,
  currentSelection: Set<string>
): Set<string> {
  const nextSelection = new Set(currentSelection)
  const [name, subgroups] = benchmark

  if (subgroups.length === 0) {
    if (nextSelection.has(name)) {
      nextSelection.delete(name)
    } else {
      nextSelection.add(name)
    }

    return nextSelection
  }

  const state = getBenchmarkSelectionState(benchmark, currentSelection)

  if (state === "checked") {
    subgroups.forEach((group) => nextSelection.delete(group))
  } else {
    subgroups.forEach((group) => nextSelection.add(group))
  }

  return nextSelection
}

export function toggleSubtaskSelection(
  subtaskName: string,
  currentSelection: Set<string>
): Set<string> {
  const nextSelection = new Set(currentSelection)

  if (nextSelection.has(subtaskName)) {
    nextSelection.delete(subtaskName)
  } else {
    nextSelection.add(subtaskName)
  }

  return nextSelection
}
