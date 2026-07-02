import type { components } from "@/types/schema"

export type LeaderboardRequest = components["schemas"]["LeaderboardRequest"]
export type LeaderboardRead = components["schemas"]["LeaderboardRead"]
export type LeaderboardRow = components["schemas"]["LeaderboardRowRead"]
export type LeaderboardScore = components["schemas"]["LeaderboardScoreRead"]
export type LeaderboardBenchmarkOptions = Record<string, string[]>
