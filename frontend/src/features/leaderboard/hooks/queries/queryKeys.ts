export const leaderboardQueryKeys = {
  all: ["leaderboard"] as const,
  result: (benchmarks: string[]) =>
    [...leaderboardQueryKeys.all, "result", benchmarks] as const,
}
