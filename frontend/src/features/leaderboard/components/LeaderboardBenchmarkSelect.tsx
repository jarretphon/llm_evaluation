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
import { useGetLeaderboardBenchmarkOptions } from "../hooks/queries/useLeaderboard"

type LeaderboardBenchmarkSelectProps = {
  selectedBenchmarks: string[]
  onChange: (benchmarks: string[]) => void
}

export function LeaderboardBenchmarkSelect({
  selectedBenchmarks,
  onChange,
}: LeaderboardBenchmarkSelectProps) {
  const { data, isPending, error } = useGetLeaderboardBenchmarkOptions()

  if (isPending) {
    return (
      <div className="rounded-lg border border-white/10 bg-[#151515] p-8 text-center text-sm text-white/60">
        Loading benchmarks...
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-500/30 bg-[#151515] p-8 text-center text-sm text-red-300">
        Failed to load benchmarks: {error.message}
      </div>
    )
  }

  const optionCount = Object.values(data).reduce(
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
            {Object.entries(data).map(([groupName, benchmarks]) => (
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
      </CardContent>
    </Card>
  )
}
