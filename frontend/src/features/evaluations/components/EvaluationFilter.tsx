import { Search } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { FilterOption } from "@/data/evaluations"

const filters: Array<{ value: FilterOption; label: string }> = [
  { value: "all", label: "All" },
  { value: "running", label: "Running" },
  { value: "completed", label: "Completed" },
  { value: "failed", label: "Failed" },
  { value: "queued", label: "Queued" },
]

type ModelFiltersProps = {
  searchQuery: string
  onSearchChange: (value: string) => void
  selectedFilter: FilterOption
  onFilterChange: (value: FilterOption) => void
  counts: Record<FilterOption, number>
}

export function ModelFilters({
  searchQuery,
  onSearchChange,
  selectedFilter,
  onFilterChange,
  counts,
}: ModelFiltersProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full max-w-lg">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search models"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            className="h-10 w-full rounded-xl border-white/15 bg-[#202020] pl-9 text-sm text-white"
          />
        </div>

        <Tabs
          value={selectedFilter}
          onValueChange={(value) => onFilterChange(value as FilterOption)}
          className="w-full lg:w-auto"
        >
          <TabsList className="w-full justify-start overflow-x-auto rounded-2xl bg-muted/60 p-1 lg:w-auto">
            {filters.map((filter) => (
              <TabsTrigger
                key={filter.value}
                value={filter.value}
                className="px-3"
              >
                <span>{filter.label}</span>
                <span className="rounded-full bg-background/70 px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
                  {counts[filter.value]}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
    </div>
  )
}
