import { Check, ChevronDownIcon, Minus } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

import { TriCheckbox } from "@/features/evaluations/components/TriCheckbox"
import type { CheckboxState } from "@/features/evaluations/components/TriCheckbox"
import {
  getBenchmarkSelectionState,
  toggleBenchmarkSelection,
  toggleSubtaskSelection,
} from "@/features/evaluations/utils/benchmarkSelection"
import type { BenchmarkTask } from "@/features/evaluations/utils/benchmarkSelection"

type BenchmarkSelectionTreeProps = {
  benchmarks: BenchmarkTask[]
  selectedItems: Set<string>
  setSelectedItems: React.Dispatch<React.SetStateAction<Set<string>>>
}

type BenchmarkTaskButtonProps = {
  name: string
  taskState: CheckboxState
  onToggle: (name: string) => void
}

function BenchmarkTaskButton({
  name,
  taskState,
  onToggle,
}: BenchmarkTaskButtonProps) {
  return (
    <button
      type="button"
      aria-pressed={
        taskState === "indeterminate" ? "mixed" : taskState === "checked"
      }
      className="flex w-full items-center gap-4 rounded-md px-4 py-2 text-left transition-colors hover:bg-accent"
      onClick={() => onToggle(name)}
    >
      <span
        aria-hidden="true"
        className={[
          "relative flex size-4 shrink-0 items-center justify-center rounded-[5px] border border-transparent bg-input/90 transition-shadow",
          taskState === "unchecked"
            ? "bg-background"
            : "bg-primary text-primary-foreground",
        ].join(" ")}
      >
        {taskState === "checked" && <Check strokeWidth={3} />}
        {taskState === "indeterminate" && <Minus strokeWidth={3} />}
      </span>
      <span className="truncate">{name}</span>
    </button>
  )
}

export function BenchmarkSelectionTree({
  benchmarks,
  selectedItems,
  setSelectedItems,
}: BenchmarkSelectionTreeProps) {
  const toggleBenchmark = (benchmark: BenchmarkTask) => {
    setSelectedItems((currentSelection) =>
      toggleBenchmarkSelection(benchmark, currentSelection)
    )
  }

  const toggleSubtask = (subtaskName: string) => {
    setSelectedItems((currentSelection) =>
      toggleSubtaskSelection(subtaskName, currentSelection)
    )
  }

  return (
    <ScrollArea className="h-[40vh] w-full rounded-md">
      <div className="flex flex-col gap-1">
        {benchmarks.map((benchmark) => {
          const [name, subgroups] = benchmark
          const benchmarkState = getBenchmarkSelectionState(
            benchmark,
            selectedItems
          )
          const hasSubgroups = subgroups.length > 0

          return hasSubgroups ? (
            <Collapsible key={name}>
              <div className="flex items-center gap-4 rounded-md px-4 py-1 transition-colors hover:bg-accent">
                <TriCheckbox
                  state={benchmarkState}
                  onClick={() => toggleBenchmark(benchmark)}
                />

                <CollapsibleTrigger className="group flex w-full items-center justify-between gap-4">
                  <div className="truncate">{name}</div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded hover:bg-accent hover:text-accent-foreground"
                  >
                    <ChevronDownIcon className="transition-transform group-data-panel-open:rotate-180" />
                  </Button>
                </CollapsibleTrigger>
              </div>

              <Separator />

              <CollapsibleContent className="style-lyra:ml-4 mt-1 ml-5">
                <div className="flex flex-col gap-1">
                  {subgroups.map((child) => (
                    <BenchmarkTaskButton
                      key={child}
                      name={child}
                      onToggle={toggleSubtask}
                      taskState={
                        selectedItems.has(child) ? "checked" : "unchecked"
                      }
                    />
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ) : (
            <BenchmarkTaskButton
              key={name}
              name={name}
              taskState={benchmarkState}
              onToggle={() => toggleBenchmark(benchmark)}
            />
          )
        })}
      </div>
    </ScrollArea>
  )
}
