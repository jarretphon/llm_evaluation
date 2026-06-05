import { useIsMobile } from "@/hooks/use-mobile.ts"
import { CurrentEvalDialog } from "@/components/CurrentEvalModal/CurrentEvalDialog"
import { CurrentEvalDrawer } from "@/components/CurrentEvalModal/CurrentEvalDrawer"
import type { EvaluationRecord } from "@/data/evaluations"
import type { Model } from "@/data/models"

import { useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import type { BenchmarkRecord } from "@/data/benchmarks"
import { EvalProgress } from "@/components/CurrentEvalModal/EvalProgress"
import { BenchmarkTable } from "./BenchmarkTable"
import { EvalDurationStats } from "./EvalDurationStats"
interface ModalProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  evaluation: (EvaluationRecord & { model: Model }) | null
  onRetryBenchmark?: (benchmark: BenchmarkRecord) => void
}

export function CurrentEvalModal({
  isOpen,
  setIsOpen,
  evaluation,
  onRetryBenchmark,
}: ModalProps) {
  const isMobile = useIsMobile()

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
      <div className="flex w-full flex-col gap-4 px-6 py-5">
        <div className="flex shrink-0 justify-between border-b border-border/60 py-5">
          <h2 className="text-xl font-semibold tracking-tight">
            {evaluation.model.name}
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
  }, [evaluation, onRetryBenchmark])

  return isMobile ? (
    <CurrentEvalDrawer isOpen={isOpen} setIsOpen={setIsOpen}>
      {content}
    </CurrentEvalDrawer>
  ) : (
    <CurrentEvalDialog isOpen={isOpen} setIsOpen={setIsOpen}>
      {content}
    </CurrentEvalDialog>
  )
}
