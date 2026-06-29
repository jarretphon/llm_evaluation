import type { components } from "@/types/schema"

import { useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { EvalProgress } from "@/features/evaluations/components/EvalProgress"
import {
  BenchmarkTable,
  type BenchmarkTableBenchmark,
} from "./BenchmarkTable"
import { EvalDurationStats } from "./EvalDurationStats"
import { ResponsiveDialog } from "@/components/ResponsiveDialog"
import { useGetEvaluationById } from "@/features/evaluations/hooks/queries/useEvaluations"

type Model = components["schemas"]["LLMRead"]
type EvaluationRead = components["schemas"]["EvaluationRead"]

interface ModalProps {
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  model?: Model
  evaluation: EvaluationRead | null
  onRetryBenchmark?: (benchmark: BenchmarkTableBenchmark) => void
}

const dialogTexts = {
  title: "Evaluation Details",
  description: "View the details of the current evaluation.",
  primaryActionLabel: "Rerun",
  secondaryActionLabel: "Close",
}

const formatDateTime = (value: string | null | undefined) => {
  if (!value) {
    return "—"
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString()
}

const formatDuration = (duration: number) => {
  if (duration <= 0) {
    return "—"
  }

  if (duration < 60) {
    return `${duration.toFixed(1)} sec`
  }

  return `${Math.round(duration / 60)} min`
}

const terminalStatuses = new Set(["completed", "failed", "partial_failed"])

const formatStatus = (status: string) => {
  return status.replaceAll("_", " ")
}

// const mockActiveEvaluation: EvaluationRead = {
//   benchmarks: [
//     {
//       name: "hello",
//       id: "aadsfa",
//       description: "hello",
//       status: "running",
//       results: {
//         accuracy: "0.8",
//         "accuracy,stderr": "0.1",
//       },
//     },
//     {
//       name: "another metric",
//       id: "agaghs",
//       description: "hello",
//       status: "running",
//       results: {
//         accuracy: "0.8",
//         "accuracy,stderr": "0.1",
//         mse: "0.2",
//         "mse,stderr": "0.1",
//         f1_score: "0.9",
//         "f1_score,stderr": "0.05",
//         precision: "0.85",
//         "precision,stderr": "0.03",
//         recall: "0.88",
//         "recall,stderr": "0.04",
//       },
//     },
//   ],
//   id: "asdfadsf",
//   metadata_entry: {
//     started_at: "sdafsdafdsaf",
//     duration: 100,
//     completed_at: "adfads",
//     estimated_end_time: "asdfafd",
//   },
// }

export function CurrentEvalDialog({
  isOpen,
  setIsOpen,
  model,
  evaluation,
  onRetryBenchmark,
}: ModalProps) {
  const evaluationId = evaluation?.id ?? ""
  const { data: latestEvaluation } = useGetEvaluationById({
    evaluationId,
    enabled: isOpen && !!evaluationId,
  })
  const activeEvaluation = latestEvaluation ?? evaluation

  const content = useMemo(() => {
    if (!activeEvaluation) {
      return null
    }

    const metadata = activeEvaluation.metadata_entry
    const progress = metadata.progress ?? 0
    const status = activeEvaluation.status
    const isTerminalStatus = terminalStatuses.has(status)
    const isIncomplete = !isTerminalStatus && progress < 100
    const title = model?.endpoint ?? activeEvaluation.id
    const timelineRows = isTerminalStatus
      ? [
          { label: "Started", value: formatDateTime(metadata.started_at) },
          { label: "Completed", value: formatDateTime(metadata.completed_at) },
          { label: "Duration", value: formatDuration(metadata.duration) },
        ]
      : [
          { label: "Started", value: formatDateTime(metadata.started_at) },
          { label: "Duration", value: formatDuration(metadata.duration) },
          {
            label: "Estimated End",
            value: formatDateTime(metadata.estimated_end_time),
          },
        ]

    return (
      <div className="flex w-full min-w-0 flex-col gap-4 overflow-hidden">
        <div className="flex min-w-0 justify-between gap-3 border-b border-border/60 py-5">
          <h2 className="min-w-0 truncate text-xl font-semibold tracking-tight">
            {title}
          </h2>
          <Badge className="ml-auto w-fit px-2.5 capitalize">
            {formatStatus(status)}
          </Badge>
        </div>

        <EvalDurationStats data={timelineRows} />
        {isIncomplete && <EvalProgress evaluation={activeEvaluation} />}
        <BenchmarkTable
          evaluation={activeEvaluation}
          onRetryBenchmark={onRetryBenchmark}
        />
      </div>
    )
  }, [activeEvaluation, onRetryBenchmark, model])

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
