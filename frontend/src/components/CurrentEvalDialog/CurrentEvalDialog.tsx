import type { EvaluationRecord } from "@/data/evaluations"
import type { components } from "@/types/schema"

import { useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import type { BenchmarkRecord } from "@/data/benchmarks"
import { EvalProgress } from "@/components/CurrentEvalDialog/EvalProgress"
import { BenchmarkTable } from "./BenchmarkTable"
import { EvalDurationStats } from "./EvalDurationStats"
import { ResponsiveDialog } from "@/components/ResponsiveDialog"

type Model = components["schemas"]["LLMRead"]
interface ModalProps {
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  model: Model
  evaluation: EvaluationRecord | null
  onRetryBenchmark?: (benchmark: BenchmarkRecord) => void
}

const dialogTexts = {
  title: "Evaluation Details",
  description: "View the details of the current evaluation.",
  primaryActionLabel: "Rerun",
  secondaryActionLabel: "Close",
}

export function CurrentEvalDialog({
  isOpen,
  setIsOpen,
  model,
  evaluation,
  onRetryBenchmark,
}: ModalProps) {
  const content = useMemo(() => {
    if (!evaluation) {
      return null
    }

    const isRunning = evaluation.evalStatus === "running"
    const timelineRows = isRunning
      ? [
          { label: "Started", value: evaluation.metadata.start },
          { label: "Duration", value: evaluation.metadata.duration },
          {
            label: "Estimated End",
            value: evaluation.metadata.estimatedEnd ?? "—",
          },
        ]
      : [
          { label: "Started", value: evaluation.metadata.start },
          { label: "Ended", value: evaluation.metadata.end ?? "—" },
          { label: "Duration", value: evaluation.metadata.duration },
        ]

    return (
      <div className="flex w-full flex-col gap-4">
        <div className="flex shrink-0 justify-between border-b border-border/60 py-5">
          <h2 className="text-xl font-semibold tracking-tight">
            {model.endpoint}
          </h2>
          <Badge className="ml-auto w-fit px-2.5 capitalize">
            {evaluation.evalStatus}
          </Badge>
        </div>

        <EvalDurationStats data={timelineRows} />
        {isRunning && <EvalProgress evaluation={evaluation} />}
        <BenchmarkTable
          evaluation={evaluation}
          onRetryBenchmark={onRetryBenchmark}
        />
      </div>
    )
  }, [evaluation, onRetryBenchmark, model])

  return (
    <ResponsiveDialog
      dialogTexts={dialogTexts}
      isOpen={isOpen}
      setIsOpen={setIsOpen}
    >
      {content}
    </ResponsiveDialog>
  )
}
