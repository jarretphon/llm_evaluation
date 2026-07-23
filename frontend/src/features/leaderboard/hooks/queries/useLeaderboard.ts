import { useQuery } from "@tanstack/react-query"

import { leaderboardService } from "@/features/leaderboard/services/leaderboard"
import { leaderboardQueryKeys } from "@/features/leaderboard/hooks/queries/queryKeys"

export function useGetLeaderboard(selectedBenchmarks: string[]) {
  return useQuery({
    queryKey: leaderboardQueryKeys.result(selectedBenchmarks),
    queryFn: () =>
      leaderboardService.getLeaderboard({ benchmarks: selectedBenchmarks }),
    enabled: selectedBenchmarks.length > 0,
  })
}
