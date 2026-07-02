import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectGroup,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue,
} from "@/components/ui/multi-select"
import type { LeaderboardBenchmarkOptions } from "@/features/leaderboard/schemas/leaderboard"

type LeaderboardBenchmarkSelectProps = {
  benchmarkOptions: LeaderboardBenchmarkOptions
  selectedBenchmarks: string[]
  onChange: (benchmarks: string[]) => void
  isLoading?: boolean
  errorMessage?: string
}

export function LeaderboardBenchmarkSelect({
  benchmarkOptions,
  selectedBenchmarks,
  onChange,
  isLoading = false,
  errorMessage,
}: LeaderboardBenchmarkSelectProps) {
  const optionCount = Object.values(benchmarkOptions).reduce(
    (count, benchmarks) => count + benchmarks.length,
    0
  )

  return (
    <Card className="rounded-lg border border-border/60 bg-[#151515] text-white">
      <CardHeader className="gap-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="text-lg text-white">
            Select leaderboard benchmarks
          </CardTitle>
          <Badge variant="outline" className="rounded-full px-2">
            {selectedBenchmarks.length}/{optionCount}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading && (
          <p className="text-sm text-white/60">Loading benchmarks...</p>
        )}
        {errorMessage && <p className="text-sm text-red-400">{errorMessage}</p>}
        {!isLoading && !errorMessage && (
          <MultiSelect values={selectedBenchmarks} onValuesChange={onChange}>
            <MultiSelectTrigger className="w-full max-w-160">
              <MultiSelectValue placeholder="Select benchmarks" />
            </MultiSelectTrigger>
            <MultiSelectContent
              search={{
                placeholder: "Search benchmarks...",
                emptyMessage: "No benchmarks found.",
              }}
            >
              {Object.entries(benchmarkOptions).map(([groupName, benchmarks]) => (
                <MultiSelectGroup key={groupName} heading={groupName}>
                  {benchmarks.map((benchmark) => (
                    <MultiSelectItem key={benchmark} value={benchmark}>
                      {benchmark}
                    </MultiSelectItem>
                  ))}
                </MultiSelectGroup>
              ))}
            </MultiSelectContent>
          </MultiSelect>
        )}
      </CardContent>
    </Card>
  )
}
