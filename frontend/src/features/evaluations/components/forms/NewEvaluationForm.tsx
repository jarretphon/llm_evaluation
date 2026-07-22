import { Check, ChevronDownIcon, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"

import { TriCheckbox } from "@/features/evaluations/components/TriCheckbox"
import type { CheckboxState } from "@/features/evaluations/components/TriCheckbox"

import { useCreateEvaluation } from "@/features/evaluations/hooks/queries/useEvaluations"
import type { EvaluationCreate } from "@/features/evaluations/schemas/evaluations"
import type { components } from "@/types/schema"
import { toast } from "sonner"

type Task = [name: string, subgroups: string[]]
type TaskProps = {
  name: string
  taskState: CheckboxState
  onToggle: (name: string) => void
}
type Model = components["schemas"]["LLMRead"]

const DEFAULT_EVALUATION_MODEL_NAME = "default"

function Task({ name, taskState, onToggle }: TaskProps) {
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

const getTaskState = (benchmark: Task, selected: Set<string>): CheckboxState => {
  const [name, subgroups] = benchmark
  // Benchmark is a standalone task
  if (subgroups.length === 0) {
    return selected.has(name) ? "checked" : "unchecked"
  }

  // Benchmark consists of subgroups
  const selectedCount = subgroups.filter((g) => selected.has(g)).length

  if (selectedCount === 0) {
    return "unchecked"
  }

  if (selectedCount === subgroups.length) {
    return "checked"
  }

  return "indeterminate"
}

export function NewEvaluationForm({
  formId,
  model,
  benchmarks,
  selectedItems,
  setSelectedItems,
  onSubmitSuccess,
}: {
  formId: string
  model: Model
  benchmarks: Task[]
  selectedItems: Set<string>
  setSelectedItems: React.Dispatch<React.SetStateAction<Set<string>>>
  onSubmitSuccess: () => void
}) {
  const { mutate: createEvaluation, isPending } = useCreateEvaluation()

  const selectedBenchmarkNames = Array.from(selectedItems)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (isPending) {
      return
    }

    if (selectedBenchmarkNames.length === 0) {
      toast.error("Select at least one benchmark to start an evaluation.")
      return
    }

    const evaluationCreate: EvaluationCreate = {
      model_id: model.id,
      model_endpoint: model.endpoint,
      model_name: DEFAULT_EVALUATION_MODEL_NAME,
      benchmarks: selectedBenchmarkNames,
    }

    createEvaluation(evaluationCreate, {
      onSuccess: () => {
        toast.success("Evaluation queued.")
        onSubmitSuccess()
      },
      onError: (error) => {
        toast.error(`Failed to register evaluation. Error: ${error}`)
      },
    })
  }

  const toggleTask = (benchmark: Task) => {
    setSelectedItems((currentSelection) => {
      const nextSelection = new Set(currentSelection)
      const state = getTaskState(benchmark, currentSelection)

      // Benchmark is a standalone task
      const [name, subgroups] = benchmark
      if (subgroups.length === 0) {
        nextSelection.has(name)
          ? nextSelection.delete(name)
          : nextSelection.add(name)
        return nextSelection
      }

      // Benchmark consists of subgroups
      // Automatically select/deselect all subgroups based on the current state of the benchmark
      if (state === "checked") {
        subgroups.forEach((g) => nextSelection.delete(g))
      } else {
        subgroups.forEach((g) => nextSelection.add(g))
      }
      return nextSelection
    })
  }

  const toggleSubtask = (groupId: string) => {
    setSelectedItems((currentSelection) => {
      const nextSelection = new Set(currentSelection)
      nextSelection.has(groupId)
        ? nextSelection.delete(groupId)
        : nextSelection.add(groupId)
      return nextSelection
    })
  }

  return (
    <form id={formId} onSubmit={handleSubmit}>
      <fieldset disabled={isPending}>
        <ScrollArea className="h-[40vh] w-full rounded-md">
          <div className="flex flex-col gap-1">
            {benchmarks.map((benchmark) => {
              const [name, subgroups] = benchmark
              const benchmarkState = getTaskState(benchmark, selectedItems)
              const hasSubgroups = subgroups.length > 0

              return hasSubgroups ? (
                <Collapsible key={name}>
                  <div className="flex items-center gap-4 rounded-md px-4 py-1 transition-colors hover:bg-accent">
                    <TriCheckbox
                      state={benchmarkState}
                      onClick={() => toggleTask(benchmark)}
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
                        <Task
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
                <Task
                  key={name}
                  name={name}
                  taskState={benchmarkState}
                  onToggle={() => toggleTask(benchmark)}
                />
              )
            })}
          </div>
        </ScrollArea>
      </fieldset>
    </form>
  )
}
