import { models } from "./models"
import type { EvaluationStatus } from "./evaluations"

export interface ModelEvaluationRun {
  id: string
  modelId: string
  status: EvaluationStatus
  startedAt: string
  duration: string
  progress?: number
  benchmarkCount: number
}

const statusCycle: EvaluationStatus[] = [
  "running",
  "completed",
  "queued",
  "failed",
]

const formatDateTime = (date: Date) =>
  date.toISOString().slice(0, 16).replace("T", " ")

const baseDate = new Date("2026-06-02T09:00:00Z")

export const modelEvaluationRuns: ModelEvaluationRun[] = models.flatMap(
  (model, modelIndex) => {
    const runCount = 2 + (modelIndex % 3)

    return Array.from({ length: runCount }, (_, runIndex) => {
      const status = statusCycle[(modelIndex + runIndex) % statusCycle.length]
      const startOffsetHours = (modelIndex * 3 + runIndex * 2 + 1) * 8
      const startedAt = new Date(
        baseDate.getTime() - startOffsetHours * 60 * 60 * 1000
      )
      const durationMinutes = 18 + modelIndex * 6 + runIndex * 4
      const progress =
        status === "running"
          ? ((modelIndex * 17 + runIndex * 11) % 90) + 5
          : undefined

      return {
        id: `${model.id}-run-${runIndex + 1}`,
        modelId: model.id,
        status,
        startedAt: formatDateTime(startedAt),
        duration: `${durationMinutes} min`,
        progress,
        benchmarkCount: 3 + ((modelIndex + runIndex) % 4),
      }
    })
  }
)
