import { CirclePlay, Search } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { NewEvaluationDialog } from "@/components/new-evaluation-dialog"
import { CurrentEvaluationDialog } from "@/components/current-evaluation-dialog"

import {
  evaluations,
  type EvaluationRecord,
  type EvaluationStatus,
  type FilterOption,
} from "@/data/evaluations"

const evaluationRecords = evaluations

const filters: Array<{ value: FilterOption; label: string }> = [
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
  const progress = record.metadata.progress ?? 0
  const type = record.evalStatus

  return type === "running" ? (
    <div className="flex w-full flex-col gap-2 sm:ml-4 sm:shrink-0 sm:flex-row sm:items-center sm:gap-4 lg:w-90">
      <div className="w-full">
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
    <div className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground capitalize sm:ml-4">
      <Badge variant="outline">{type}</Badge>
    </div>
  )
}

export function EvaluationTable() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [activeEvaluation, setActiveEvaluation] =
    useState<EvaluationRecord | null>(null)
  const [selectedFilter, setSelectedFilter] = useState<FilterOption>("all")
  const filteredEvaluations = useMemo(
    () =>
      selectedFilter === "all"
        ? evaluationRecords
        : evaluationRecords.filter(
            (evaluation) => evaluation.evalStatus === selectedFilter
          ),
    [selectedFilter]
  )

  const counts = useMemo(
    () =>
      evaluations.reduce<Record<string, number>>(
        (acc, e) => {
          acc.all += 1
          acc[e.evalStatus] += 1
          return acc
        },
        { ...initialCounts }
      ),
    []
  )

  return (
    <div className="mx-auto h-full w-full max-w-360 px-4 text-white">
      <Card className="h-full w-full rounded-2xl border border-white/10 bg-[#171717] p-4 shadow-2xl">
        <div className="flex flex-col gap-3 lg:hidden">
          <div className="flex items-center gap-2">
            <div className="relative min-w-0 flex-1">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <Input
                placeholder="Search ..."
                className="h-10 w-full rounded-xl border-white/15 bg-[#202020] pl-9 text-sm text-white"
              />
            </div>

            <Button
              className="shrink-0 cursor-pointer rounded-md whitespace-nowrap"
              onClick={() => setIsDialogOpen(true)}
            >
              <CirclePlay className="size-4" />
              <span className="ml-1 hidden sm:inline">New Evaluation</span>
            </Button>
          </div>

          <Tabs
            value={selectedFilter}
            onValueChange={(value: FilterOption) => setSelectedFilter(value)}
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

        <div className="hidden items-center gap-3 lg:flex lg:justify-between">
          <div className="relative w-full max-w-xs">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              placeholder="Search models..."
              className="h-10 w-full rounded-xl border-white/15 bg-[#202020] pl-9 text-sm text-white"
            />
          </div>

          <div className="flex items-center gap-4">
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

            <Button
              className="shrink-0 cursor-pointer rounded-md whitespace-nowrap"
              size="sm"
              onClick={() => setIsDialogOpen(true)}
            >
              <CirclePlay className="size-4" />
              <span className="ml-1">New Evaluation</span>
            </Button>
          </div>
        </div>

        <div className="mt-4 space-y-4">
          {filteredEvaluations.map((e) => (
            <div
              key={e.model.name}
              className="flex cursor-pointer flex-col gap-4 rounded-xl bg-[#202020] p-4 transition hover:bg-[#252525] sm:flex-row sm:items-center sm:justify-between"
              onClick={() => {
                setActiveEvaluation(e)
                setIsDetailsOpen(true)
              }}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-[#1b1b1b] text-sm font-bold text-white">
                  {e.model.symbol}
                </div>

                <div className="min-w-0">
                  <h3 className="truncate text-sm font-semibold text-white">
                    {e.model.name}
                  </h3>
                  <p className="mt-1 text-xs font-medium tracking-wide text-zinc-400">
                    {e.model.description}
                  </p>
                </div>
              </div>

              <EvaluationProgress record={e} />
            </div>
          ))}
        </div>
      </Card>
      <NewEvaluationDialog isOpen={isDialogOpen} setIsOpen={setIsDialogOpen} />
      <CurrentEvaluationDialog
        isOpen={isDetailsOpen}
        setIsOpen={setIsDetailsOpen}
        evaluation={activeEvaluation}
      />
    </div>
  )
}
