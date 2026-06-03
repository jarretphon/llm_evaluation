import { benchmarks, type BenchmarkRecord } from "./benchmarks"
import { type Model, models } from "./models"

export type EvaluationStatus = "running" | "completed" | "failed" | "queued"

interface EvalMetadata {
  start: string
  duration: string
  end?: string
  estimatedEnd?: string
  progress?: number
}

export interface EvaluationRecord {
  id: string
  metadata: EvalMetadata
  evalStatus: EvaluationStatus
  benchmarkRecords: BenchmarkRecord[]
}

export type FilterOption = EvaluationStatus | "all"

export const evaluations: EvaluationRecord[] = models.map(
  (model: Model, index: number) => {
    const evalStatus = setEvalStatus(index)
    const metadata = setMetadata(index, evalStatus)
    const selectedBenchmarks = setBenchmarks(index)

    return {
      id: `eval-${index}`,
      model,
      metadata,
      evalStatus,
      benchmarkRecords: selectedBenchmarks,
    }
  }
)

function setEvalStatus(index: number): EvaluationStatus {
  let evalStatus: EvaluationStatus = "running"

  if (index % 4 === 0) {
    evalStatus = "completed"
  }

  if (index === 2) {
    evalStatus = "failed"
  }

  if (index === 6) {
    evalStatus = "queued"
  }

  return evalStatus
}

function formatTime(hours: number, minutes: number): string {
  return `${hours}:${minutes.toString().padStart(2, "0")} AM`
}

function setMetadata(
  index: number,
  evalStatus: EvaluationStatus
): EvalMetadata {
  const months = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ]
  const durationMinutes = 18 + index * 5
  const startYear = 2020 + index
  const startMonth = months[index % months.length]
  const start = `${startMonth} ${startYear}`

  const timeMinutes = (15 + index * 7) % 60
  const timeHours = 9 + (index % 3)

  const metadata: EvalMetadata = {
    start,
    duration: `${durationMinutes} min`,
  }

  if (evalStatus === "completed") {
    metadata.end = formatTime(timeHours + 1, timeMinutes)
  }

  if (evalStatus === "running") {
    metadata.estimatedEnd = formatTime(timeHours + 1, timeMinutes)
    metadata.progress = (index * 13) % 100
  }

  return metadata
}

function setBenchmarks(index: number): BenchmarkRecord[] {
  const benchmarkCount = 3 + (index % 3)
  const benchmarkStart = index % benchmarks.length
  const selectedBenchmarks = Array.from(
    { length: benchmarkCount },
    (_, i) => benchmarks[(benchmarkStart + i * 2) % benchmarks.length]
  )

  return selectedBenchmarks.map((benchmark, i) => ({
    benchmark,
    status: "running",
    progress: 5 + ((index * 17 + i * 13) % 90),
  }))
}
