import { CirclePlay, Search } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { NewEvalModal } from "@/components/NewEvalModal/NewEvalModal"
import { CurrentEvalModal } from "@/components/CurrentEvalModal/CurrentEvalModal"

import {
  evaluations,
  type EvaluationRecord,
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

const initialCounts: Record<FilterOption, number> = {
  all: 0,
  running: 0,
  completed: 0,
  failed: 0,
  queued: 0,
}

const SearchField = ({ placeholder }: { placeholder: string }) => {
  return (
    <div className="relative w-full min-w-0 flex-1 lg:w-full lg:max-w-xs">
      <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
      <Input
        placeholder={placeholder}
        className="h-10 w-full rounded-xl border-white/15 bg-[#202020] pl-9 text-sm text-white"
      />
    </div>
  )
}

const FilterTabs = ({
  selectedFilter,
  counts,
  onChange,
}: {
  selectedFilter: FilterOption
  counts: Record<FilterOption, number>
  onChange: (value: FilterOption) => void
}) => {
  return (
    <Tabs value={selectedFilter} onValueChange={onChange} className="gap-4">
      <TabsList className="w-full justify-start overflow-x-auto rounded-2xl bg-muted/60 p-1">
        {filters.map((f) => (
          <TabsTrigger key={f.value} value={f.value} className="px-2 xl:px-4">
            <span>{f.label}</span>
            <span className="rounded-full bg-background/70 px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
              {counts[f.value]}
            </span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
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

const EvaluationRow = ({
  record,
  onSelect,
}: {
  record: EvaluationRecord
  onSelect: (record: EvaluationRecord) => void
}) => {
  return (
    <div
      className="flex cursor-pointer flex-col gap-4 rounded-xl bg-[#202020] p-4 transition hover:bg-[#252525] sm:flex-row sm:items-center sm:justify-between"
      onClick={() => onSelect(record)}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-[#1b1b1b] text-sm font-bold text-white">
          {record.model.symbol}
        </div>

        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-white">
            {record.model.name}
          </h3>
          <p className="mt-1 text-xs font-medium tracking-wide text-zinc-400">
            {record.model.description}
          </p>
        </div>
      </div>

      <EvaluationProgress record={record} />
    </div>
  )
}

export function EvaluationTable() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [activeEvaluation, setActiveEvaluation] =
    useState<EvaluationRecord | null>(null)
  const [selectedFilter, setSelectedFilter] = useState<FilterOption>("all")
  const searchPlaceholder = "Search models..."
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
      evaluations.reduce<Record<FilterOption, number>>(
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
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 lg:flex lg:justify-between">
          <SearchField placeholder={searchPlaceholder} />

          <Button
            className="order-2 w-fit shrink-0 cursor-pointer rounded-md whitespace-nowrap lg:order-3 lg:h-8 lg:w-auto lg:gap-1 lg:px-3"
            onClick={() => setIsDialogOpen(true)}
          >
            <CirclePlay className="size-4" />
            <span className="ml-1 hidden sm:inline">New Evaluation</span>
          </Button>

          <div className="order-3 col-span-2 w-full lg:order-2 lg:ml-auto lg:w-auto">
            <FilterTabs
              selectedFilter={selectedFilter}
              counts={counts}
              onChange={(value) => setSelectedFilter(value)}
            />
          </div>
        </div>

        <div className="mt-4 space-y-4">
          {filteredEvaluations.map((e) => (
            <EvaluationRow
              key={e.model.name}
              record={e}
              onSelect={(record) => {
                setActiveEvaluation(record)
                setIsDetailsOpen(true)
              }}
            />
          ))}
        </div>
      </Card>
      <NewEvalModal isOpen={isDialogOpen} setIsOpen={setIsDialogOpen} />
      <CurrentEvalModal
        isOpen={isDetailsOpen}
        setIsOpen={setIsDetailsOpen}
        evaluation={activeEvaluation}
      />
    </div>
  )
}
