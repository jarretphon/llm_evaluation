import { useQuery } from "@tanstack/react-query"

import { leaderboardService } from "@/features/leaderboard/services/leaderboard"

export function useGetLeaderboardBenchmarkOptions() {
  return useQuery({
    queryKey: ["leaderboard", "benchmarks"],
    queryFn: leaderboardService.getBenchmarkOptions,
  })
}

export function useGetLeaderboard(selectedBenchmarks: string[]) {
  return useQuery({
    queryKey: ["leaderboard", selectedBenchmarks],
    queryFn: () =>
      leaderboardService.getLeaderboard({ benchmarks: selectedBenchmarks }),
    enabled: selectedBenchmarks.length > 0,
  })
}
