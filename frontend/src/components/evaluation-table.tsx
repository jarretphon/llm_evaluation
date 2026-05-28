import { Search } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useMemo, useState } from "react"

type EvaluationStatus = "all" | "running" | "completed" | "failed" | "queued"

type EvaluationRecord = {
  symbol: string
  name: string
  meta: string
  type: EvaluationStatus
  progress: number
}

const evaluations: EvaluationRecord[] = [
  {
    symbol: "VOO",
    name: "Claude Opus 4.7",
    meta: "Start: JAN 2021 ·",
    type: "running",
    progress: 33,
  },
  {
    symbol: "VIG",
    name: "GPT-5.5",
    meta: "Start: MAR 2022",
    type: "running",
    progress: 67,
  },
  {
    symbol: "AAPL",
    name: "Claude Opus 4.6",
    meta: "Start: JAN 2020 ·",
    type: "running",
    progress: 28,
  },
  {
    symbol: "O",
    name: "Gemini Flash 3.5",
    meta: "Start: JUN 2023",
    type: "completed",
    progress: 93,
  },
]

const filters: Array<{ value: EvaluationStatus; label: string }> = [
  { value: "all", label: "All" },
  { value: "running", label: "Running" },
  { value: "completed", label: "Completed" },
  { value: "failed", label: "Failed" },
  { value: "queued", label: "Queued" },
]

const initialCounts = {
  all: 0,
  running: 0,
  completed: 0,
  failed: 0,
  queued: 0,
}

const EvaluationProgress = ({ record }: { record: EvaluationRecord }) => {
  const { type, progress } = record

  return type === "running" ? (
    <div className="ml-4 flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center sm:gap-4">
      <div className="w-full max-w-[18rem] shrink-0 lg:w-72">
        <div className="flex items-center justify-between text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
          <span>Status</span>
          <span>{type}</span>
        </div>

        <div className="mt-2 flex items-center gap-3">
          <Progress value={progress} className="flex-1" />
          <span className="text-sm font-medium text-foreground/80 tabular-nums">
            {progress}%
          </span>
        </div>
      </div>
    </div>
  ) : (
    <div className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground capitalize">
      <Badge variant="outline">{type}</Badge>
    </div>
  )
}

export function EvaluationTable() {
  const [selectedFilter, setSelectedFilter] = useState<EvaluationStatus>("all")
  const filteredEvaluations = useMemo(
    () =>
      selectedFilter === "all"
        ? evaluations
        : evaluations.filter(
            (evaluation) => evaluation.type === selectedFilter
          ),
    [selectedFilter]
  )

  const counts = useMemo(
    () =>
      evaluations.reduce<Record<string, number>>(
        (acc, e) => {
          acc.all += 1
          acc[e.type] += 1
          return acc
        },
        { ...initialCounts }
      ),
    []
  )

  return (
    <div className="w-full text-white">
      <Card className="rounded-2xl border border-white/10 bg-[#171717] p-4 shadow-2xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              placeholder="Search holdings or tickers..."
              className="h-10 rounded-xl border-white/15 bg-[#202020] pl-9 text-sm text-white"
            />
          </div>

          <Tabs
            value={selectedFilter}
            onValueChange={(value: EvaluationStatus) =>
              setSelectedFilter(value)
            }
            className="gap-4"
          >
            <TabsList className="w-full justify-start overflow-x-auto rounded-2xl bg-muted/60 p-1">
              {filters.map((f) => (
                <TabsTrigger key={f.value} value={f.value} className="px-4">
                  <span>{f.label}</span>
                  <span className="rounded-full bg-background/70 px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
                    {counts[f.value]}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div className="mt-4 space-y-4">
          {filteredEvaluations.map((e) => (
            <div
              key={e.symbol}
              className="flex items-center justify-between rounded-xl bg-[#202020] p-4 transition hover:bg-[#252525]"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-[#1b1b1b] text-sm font-bold text-white">
                  {e.symbol}
                </div>

                <div>
                  <h3 className="truncate text-sm font-semibold text-white">
                    {e.name}
                  </h3>
                  <p className="mt-1 text-xs font-medium tracking-wide text-zinc-400">
                    {e.meta}
                  </p>
                </div>
              </div>

              <EvaluationProgress record={e} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
