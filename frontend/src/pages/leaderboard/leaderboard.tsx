import { useState } from "react"

import { LeaderboardBenchmarkSelect } from "@/features/leaderboard/components/LeaderboardBenchmarkSelect"
import { LeaderboardEmpty } from "@/features/leaderboard/components/LeaderboardEmpty"
import { LeaderboardTable } from "@/features/leaderboard/components/LeaderboardTable"
import {
  useGetLeaderboard,
  useGetLeaderboardBenchmarkOptions,
} from "@/features/leaderboard/hooks/queries/useLeaderboard"

export function Leaderboard() {
  const [selectedBenchmarks, setSelectedBenchmarks] = useState<string[]>([])
  const {
    data: benchmarkOptions = {},
    isPending: isBenchmarkOptionsPending,
    error: benchmarkOptionsError,
  } = useGetLeaderboardBenchmarkOptions()
  const {
    data: leaderboard,
    isPending: isLeaderboardPending,
    error: leaderboardError,
  } = useGetLeaderboard(selectedBenchmarks)

  return (
    <div className="mx-auto flex h-full w-full max-w-360 flex-col gap-6 p-4 text-white md:p-6">
      <LeaderboardBenchmarkSelect
        benchmarkOptions={benchmarkOptions}
        selectedBenchmarks={selectedBenchmarks}
        onChange={setSelectedBenchmarks}
        isLoading={isBenchmarkOptionsPending}
        errorMessage={benchmarkOptionsError?.message}
      />

      {selectedBenchmarks.length === 0 && <LeaderboardEmpty />}

      {selectedBenchmarks.length > 0 && isLeaderboardPending && (
        <div className="rounded-lg border border-white/10 bg-[#151515] p-8 text-center text-sm text-white/60">
          Loading leaderboard...
        </div>
      )}

      {selectedBenchmarks.length > 0 && leaderboardError && (
        <div className="rounded-lg border border-red-500/30 bg-[#151515] p-8 text-center text-sm text-red-300">
          Failed to load leaderboard: {leaderboardError.message}
        </div>
      )}

      {leaderboard && selectedBenchmarks.length > 0 && (
        <LeaderboardTable leaderboard={leaderboard} />
      )}
    </div>
  )
}
