import { useMemo, useState } from "react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
  CardDescription,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import type { EvaluationRecord } from "@/data/evaluations"
import type { Model } from "@/data/models"
import { EvaluationCard } from "@/components/EvaluationCard"

type ModelEvaluationPanelProps = {
  model: Model | null
  evaluations: EvaluationRecord[]
  onSelectEvaluation: (evaluation: EvaluationRecord) => void
}

type TimeRange = "today" | "7d" | "30d" | "custom"

const rangeOptions: Array<{ value: TimeRange; label: string }> = [
  { value: "today", label: "Today" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Past month" },
  { value: "custom", label: "Custom" },
]

const startOfDay = (date: Date) => {
  const next = new Date(date)
  next.setHours(0, 0, 0, 0)
  return next
}

const endOfDay = (date: Date) => {
  const next = new Date(date)
  next.setHours(23, 59, 59, 999)
  return next
}

const addDays = (date: Date, days: number) => {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

const toInputDate = (date: Date) => date.toISOString().slice(0, 10)

const parseEvaluationDate = (value: string) => new Date(value.replace(" ", "T"))

const getRange = (
  timeRange: TimeRange,
  customStart: string,
  customEnd: string
) => {
  const today = new Date()

  if (timeRange === "today") {
    return { start: startOfDay(today), end: endOfDay(today) }
  }

  if (timeRange === "7d") {
    return { start: startOfDay(addDays(today, -6)), end: endOfDay(today) }
  }

  if (timeRange === "30d") {
    return { start: startOfDay(addDays(today, -30)), end: endOfDay(today) }
  }

  return {
    start: startOfDay(new Date(`${customStart}T00:00:00`)),
    end: endOfDay(new Date(`${customEnd}T00:00:00`)),
  }
}

export function ModelEvaluationPanel({
  model,
  evaluations,
  onSelectEvaluation,
}: ModelEvaluationPanelProps) {
  const today = useMemo(() => new Date(), [])
  const [timeRange, setTimeRange] = useState<TimeRange>("7d")
  const [customStart, setCustomStart] = useState(() =>
    toInputDate(addDays(today, -6))
  )
  const [customEnd, setCustomEnd] = useState(() => toInputDate(today))

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

  const sortedEvaluations = [...evaluations].sort((a, b) =>
    b.metadata.start.localeCompare(a.metadata.start)
  )
  const range = getRange(timeRange, customStart, customEnd)
  const filteredEvaluations = sortedEvaluations.filter((evaluation) => {
    const evaluationDate = parseEvaluationDate(evaluation.metadata.start)

    if (Number.isNaN(evaluationDate.getTime())) {
      return true
    }

    return evaluationDate >= range.start && evaluationDate <= range.end
  })

  return (
    <Card className="@container/card h-full gap-0">
      <CardHeader>
        <CardTitle>Evaluations</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Evaluation instances for the selected model.
          </span>
          <span className="@[540px]/card:hidden">Last 3 months</span>
        </CardDescription>
        <CardAction>
          <DateFilter
            value={timeRange}
            setValue={setTimeRange}
            customStart={customStart}
            customEnd={customEnd}
            onCustomStartChange={setCustomStart}
            onCustomEndChange={setCustomEnd}
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

const DateFilter = ({
  value,
  setValue,
  customStart,
  customEnd,
  onCustomStartChange,
  onCustomEndChange,
}: {
  value: TimeRange
  setValue: (timeRange: TimeRange) => void
  customStart: string
  customEnd: string
  onCustomStartChange: (value: string) => void
  onCustomEndChange: (value: string) => void
}) => {
  return (
    <div className="flex w-full flex-col gap-3 md:w-auto md:items-end">
      <ToggleGroup
        multiple={false}
        value={value ? [value] : []}
        onValueChange={(nextValue) => {
          setValue((nextValue[0] as TimeRange | undefined) ?? "7d")
        }}
        variant="outline"
        className="hidden *:data-[slot=toggle-group-item]:px-4! @[700px]/card:flex"
      >
        {rangeOptions.map((option) => {
          return (
            <ToggleGroupItem key={option.value} value={option.value}>
              {option.label}
            </ToggleGroupItem>
          )
        })}
      </ToggleGroup>

      <Select
        value={value}
        onValueChange={(nextValue) => {
          if (nextValue !== null) {
            setValue(nextValue as TimeRange)
          }
        }}
      >
        <SelectTrigger
          className="flex w-44 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[700px]/card:hidden"
          size="sm"
          aria-label="Select date range"
        >
          <SelectValue placeholder="Last 7 days" />
        </SelectTrigger>
        <SelectContent className="rounded-xl">
          {rangeOptions.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="rounded-lg"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {value === "custom" && (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-white/50">Start</span>
            <Input
              type="date"
              value={customStart}
              max={customEnd}
              onChange={(event) => onCustomStartChange(event.target.value)}
              className="h-10 rounded-md border-white/15 bg-[#202020] text-white"
            />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-white/50">End</span>
            <Input
              type="date"
              value={customEnd}
              min={customStart}
              onChange={(event) => onCustomEndChange(event.target.value)}
              className="h-10 rounded-md border-white/15 bg-[#202020] text-white"
            />
          </label>
        </div>
      )}
    </div>
  )
}
