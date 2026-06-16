import { useState } from "react"
import { addDays, endOfDay, parse, startOfDay } from "date-fns"
import { type DateRange } from "react-day-picker"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
  CardDescription,
} from "@/components/ui/card"

// import type { EvaluationRecord } from "@/data/evaluations"
// import type { Model } from "@/data/models"
import { EvaluationCard } from "@/components/EvaluationCard"
import { type dateFilter, TimeRangeFilter } from "@/components/TimeRangeFilter"
import { sortEvaluationsBy } from "@/utils/helpers"
import type { components } from "@/types/schema"

type Model = components["schemas"]["LLMRead"]
type EvaluationRecord = components["schemas"]["EvaluationRead"]

type ModelEvaluationPanelProps = {
  model: Model
  onSelectEvaluation: (evaluation: EvaluationRecord) => void
}

const getRange = (filter: dateFilter, dateRange: DateRange | undefined) => {
  const today = new Date()

  if (filter === "today") {
    return { start: startOfDay(today), end: endOfDay(today) }
  }

  if (filter === "7d") {
    return { start: startOfDay(addDays(today, -6)), end: endOfDay(today) }
  }

  if (filter === "30d") {
    return { start: startOfDay(addDays(today, -30)), end: endOfDay(today) }
  }

  return {
    start: startOfDay(dateRange?.from ?? new Date()),
    end: endOfDay(dateRange?.to ?? new Date()),
  }
}

const parseEvaluationDate = (value: string) => {
  const parsed = parse(value, "yyyy-MM-dd HH:mm", new Date())

  if (!Number.isNaN(parsed.getTime())) {
    return parsed
  }

  return new Date(value)
}

export function ModelEvaluationPanel({
  model,
  onSelectEvaluation,
}: ModelEvaluationPanelProps) {
  const [filter, setFilter] = useState<dateFilter>("7d")
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfDay(addDays(new Date(), -6)),
    to: endOfDay(new Date()),
  })

  if (!model) {
    return (
      <Card className="rounded-lg border border-border/60 bg-[#151515] text-white">
        <CardHeader>
          <CardTitle>Select a model</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-white/60">
          Choose a model card to inspect the latest evaluation runs.
        </CardContent>
      </Card>
    )
  }

  const sortedEvaluations = sortEvaluationsBy(
    model.evaluations,
    "date",
    "descending"
  )
  const range = getRange(filter, dateRange)
  const filteredEvaluations = sortedEvaluations.filter((evaluation) => {
    const evaluationDate = parseEvaluationDate(evaluation.metadata.start)

    if (Number.isNaN(evaluationDate.getTime())) {
      return true
    }

    return evaluationDate >= range.start && evaluationDate <= range.end
  })

  return (
    <Card className="@container/card h-full gap-0">
      <CardHeader className="flex min-w-0 flex-col items-start gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1">
          <CardTitle>Evaluations</CardTitle>
          <CardDescription>
            <span>Evaluation instances for the selected model.</span>
          </CardDescription>
        </div>
        <CardAction className="no-scrollbar overflow-x-auto max-sm:w-full">
          <TimeRangeFilter
            value={filter}
            setValue={setFilter}
            customDateRange={dateRange}
            setCustomDateRange={setDateRange}
          />
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {filteredEvaluations.length ? (
          <div className="flex flex-col gap-3">
            {filteredEvaluations.map((evaluation) => (
              <EvaluationCard
                key={evaluation.id}
                record={evaluation}
                onSelect={onSelectEvaluation}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-white/60">
            No evaluation instances match this date range.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
