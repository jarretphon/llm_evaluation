import { useMemo, useState } from "react"
import { CalendarDays } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import type { EvaluationStatus } from "@/data/evaluations"
import type { ModelEvaluationRun } from "@/data/model-evaluation-runs"
import type { Model } from "@/data/models"

type ModelEvaluationPanelProps = {
  model: Model | null
  runs: ModelEvaluationRun[]
  onSelectRun?: (run: ModelEvaluationRun) => void
}

type RangePreset = "today" | "last-7-days" | "past-month" | "custom"

const statusMeta: Record<
  EvaluationStatus,
  {
    label: string
    variant: "default" | "secondary" | "destructive" | "outline"
  }
> = {
  running: { label: "Running", variant: "default" },
  completed: { label: "Completed", variant: "secondary" },
  failed: { label: "Failed", variant: "destructive" },
  queued: { label: "Queued", variant: "outline" },
}

const rangeOptions: Array<{ value: RangePreset; label: string }> = [
  { value: "today", label: "Today" },
  { value: "last-7-days", label: "Last 7 days" },
  { value: "past-month", label: "Past month" },
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

const parseRunDate = (value: string) => new Date(value.replace(" ", "T"))

const getRange = (
  preset: RangePreset,
  customStart: string,
  customEnd: string
) => {
  const today = new Date()

  if (preset === "today") {
    return { start: startOfDay(today), end: endOfDay(today) }
  }

  if (preset === "last-7-days") {
    return { start: startOfDay(addDays(today, -6)), end: endOfDay(today) }
  }

  if (preset === "past-month") {
    return { start: startOfDay(addDays(today, -30)), end: endOfDay(today) }
  }

  return {
    start: startOfDay(new Date(`${customStart}T00:00:00`)),
    end: endOfDay(new Date(`${customEnd}T00:00:00`)),
  }
}

export function ModelEvaluationPanel({
  model,
  runs,
  onSelectRun,
}: ModelEvaluationPanelProps) {
  const today = useMemo(() => new Date(), [])
  const [rangePreset, setRangePreset] =
    useState<RangePreset>("last-7-days")
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

  const sortedRuns = [...runs].sort((a, b) =>
    b.startedAt.localeCompare(a.startedAt)
  )
  const range = getRange(rangePreset, customStart, customEnd)
  const filteredRuns = sortedRuns.filter((run) => {
    const runDate = parseRunDate(run.startedAt)

    if (Number.isNaN(runDate.getTime())) {
      return true
    }

    return runDate >= range.start && runDate <= range.end
  })
  const runningCount = runs.filter((run) => run.status === "running").length

  return (
    <Card className="rounded-lg border border-border/60 bg-[#151515] text-white">
      <CardHeader className="gap-4 border-b border-border/50">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-lg text-white">
                Evaluation instances
              </CardTitle>
              <Badge variant="outline" className="rounded-full px-2">
                {filteredRuns.length} shown
              </Badge>
              {runningCount > 0 ? (
                <Badge className="rounded-full px-2">
                  {runningCount} active
                </Badge>
              ) : null}
            </div>
            <p className="text-sm text-white/60">
              Review recent evaluation instances for {model.name}.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-white/50">
            <CalendarDays className="size-4" />
            {range.start.toLocaleDateString()} - {range.end.toLocaleDateString()}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            {rangeOptions.map((option) => (
              <Button
                key={option.value}
                type="button"
                variant={rangePreset === option.value ? "secondary" : "outline"}
                size="sm"
                className="rounded-md"
                onClick={() => setRangePreset(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>

          {rangePreset === "custom" ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1.5">
                <span className="text-xs font-medium text-white/50">Start</span>
                <Input
                  type="date"
                  value={customStart}
                  max={customEnd}
                  onChange={(event) => setCustomStart(event.target.value)}
                  className="h-10 rounded-md border-white/15 bg-[#202020] text-white"
                />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs font-medium text-white/50">End</span>
                <Input
                  type="date"
                  value={customEnd}
                  min={customStart}
                  onChange={(event) => setCustomEnd(event.target.value)}
                  className="h-10 rounded-md border-white/15 bg-[#202020] text-white"
                />
              </label>
            </div>
          ) : null}
        </div>
      </CardHeader>
      <CardContent>
        {filteredRuns.length ? (
          <div className="space-y-3">
            {filteredRuns.map((run, index) => (
              <EvaluationRunRow
                key={run.id}
                run={run}
                index={index}
                onSelectRun={onSelectRun}
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

const EvaluationRunRow = ({
  run,
  index,
  onSelectRun,
}: {
  run: ModelEvaluationRun
  index: number
  onSelectRun?: (run: ModelEvaluationRun) => void
}) => {
  const meta = statusMeta[run.status]

  return (
    <button
      type="button"
      className="w-full rounded-lg border border-border/60 bg-[#1a1a1a] p-4 text-left transition hover:border-white/20 hover:bg-[#202020] focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none"
      onClick={() => onSelectRun?.(run)}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-white/40 uppercase">
            Run {index + 1}
          </p>
          <p className="mt-1 text-sm font-medium text-white">
            {run.benchmarkCount} benchmarks
          </p>
        </div>
        <Badge variant={meta.variant} className="rounded-full px-2">
          {meta.label}
        </Badge>
      </div>
      <div className="mt-3 grid gap-2 text-xs text-white/60 sm:grid-cols-2">
        <div>
          <span className="text-white/40">Started:</span> {run.startedAt}
        </div>
        <div>
          <span className="text-white/40">Duration:</span> {run.duration}
        </div>
      </div>
      {run.status === "running" ? (
        <div className="mt-3 flex items-center gap-3">
          <Progress value={run.progress ?? 0} className="flex-1" />
          <span className="text-xs font-medium text-white/70 tabular-nums">
            {run.progress ?? 0}%
          </span>
        </div>
      ) : null}
    </button>
  )
}
