import { useState } from "react"

import { LeaderboardBenchmarkSelect } from "@/features/leaderboard/components/LeaderboardBenchmarkSelect"
import { LeaderboardEmpty } from "@/features/leaderboard/components/LeaderboardEmpty"
import { LeaderboardTable } from "@/features/leaderboard/components/LeaderboardTable"

export function Leaderboard() {
  const [selectedBenchmarks, setSelectedBenchmarks] = useState<string[]>([])

  return (
    <div className="mx-auto flex h-full w-full max-w-360 flex-col gap-4 px-4 pt-4 pb-1 text-foreground md:pt-6">
      <LeaderboardBenchmarkSelect
        selectedBenchmarks={selectedBenchmarks}
        onChange={setSelectedBenchmarks}
      />
      {selectedBenchmarks.length === 0 ? (
        <LeaderboardEmpty />
      ) : (
        <LeaderboardTable selectedBenchmarks={selectedBenchmarks} />
      )}
    </div>
  )
}
