import { CirclePlay, Search } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { NewEvalDialog } from "@/features/evaluations/components/NewEvalDialog"
import { CurrentEvalDialog } from "@/features/evaluations/components/CurrentEvalDialog"
import { useEvaluationEvents } from "@/features/evaluations/hooks/useEvaluationEvents"
import { useGetEvaluations } from "@/features/evaluations/hooks/queries/useEvaluations"
import type { EvaluationRead } from "@/features/evaluations/schemas/evaluations"
import { EvaluationCard } from "./EvaluationCard"

type EvaluationStatus =
  | "running"
  | "completed"
  | "failed"
  | "partial_failed"
  | "queued"
type FilterOption = EvaluationStatus | "all"

const filters: Array<{ value: FilterOption; label: string }> = [
  { value: "all", label: "All" },
  { value: "running", label: "Running" },
  { value: "completed", label: "Completed" },
  { value: "failed", label: "Failed" },
  { value: "partial_failed", label: "Partial Failed" },
  { value: "queued", label: "Queued" },
]

const initialCounts: Record<FilterOption, number> = {
  all: 0,
  running: 0,
  completed: 0,
  failed: 0,
  partial_failed: 0,
  queued: 0,
}

const SearchField = ({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string
  value: string
  onChange: (value: string) => void
}) => {
  return (
    <div className="relative w-full min-w-0 flex-1 lg:w-full lg:max-w-xs">
      <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-xl border-border bg-input/50 pl-9 text-sm text-foreground"
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

const getEvaluationStatus = (record: EvaluationRead): EvaluationStatus => {
  return record.status as EvaluationStatus
}

export function EvaluationTable() {
  useEvaluationEvents()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [activeEvaluation, setActiveEvaluation] =
    useState<EvaluationRead | null>(null)
  const [selectedFilter, setSelectedFilter] = useState<FilterOption>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const { data: evaluationRecords = [], isPending, error } = useGetEvaluations()
  const searchPlaceholder = "Search evaluations..."
  const filteredEvaluations = useMemo(() => {
    const normalisedSearch = searchQuery.trim().toLowerCase()

    return evaluationRecords.filter((evaluation) => {
      const status = getEvaluationStatus(evaluation)
      const matchesFilter =
        selectedFilter === "all" || status === selectedFilter
      const matchesSearch =
        !normalisedSearch ||
        evaluation.id.toLowerCase().includes(normalisedSearch) ||
        status.toLowerCase().includes(normalisedSearch) ||
        evaluation.benchmarks.some((benchmark) =>
          benchmark.name.toLowerCase().includes(normalisedSearch)
        )

      return matchesFilter && matchesSearch
    })
  }, [evaluationRecords, searchQuery, selectedFilter])

  const counts = useMemo(
    () =>
      evaluationRecords.reduce<Record<FilterOption, number>>(
        (acc, e) => {
          const status = getEvaluationStatus(e)
          acc.all += 1
          acc[status] += 1
          return acc
        },
        { ...initialCounts }
      ),
    [evaluationRecords]
  )

  if (isPending) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-card px-6 py-10 text-center text-sm text-destructive">
        Failed to load evaluations: {error.message}
      </div>
    )
  }

  return (
    <div className="mx-auto h-full w-full max-w-360 px-4 text-foreground">
      <Card className="h-full w-full rounded-2xl border border-border bg-card p-4 shadow-2xl">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 lg:flex lg:justify-between">
          <SearchField
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={setSearchQuery}
          />

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
            <EvaluationCard
              key={e.id}
              record={e}
              onSelect={(record) => {
                setActiveEvaluation(record)
                setIsDetailsOpen(true)
              }}
            />
          ))}
          {filteredEvaluations.length === 0 && (
            <div className="rounded-xl border border-border bg-muted/30 px-6 py-10 text-center text-sm text-muted-foreground">
              No evaluations found.
            </div>
          )}
        </div>
      </Card>
      <NewEvalDialog isOpen={isDialogOpen} setIsOpen={setIsDialogOpen} />
      <CurrentEvalDialog
        isOpen={isDetailsOpen}
        setIsOpen={setIsDetailsOpen}
        evaluation={activeEvaluation}
      />
    </div>
  )
}
