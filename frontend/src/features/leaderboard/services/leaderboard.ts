import { apiClient } from "@/services/api/client"
import type {
  LeaderboardBenchmarkOptions,
  LeaderboardRead,
  LeaderboardRequest,
} from "@/features/leaderboard/schemas/leaderboard"

export const leaderboardService = {
  getBenchmarkOptions: async (): Promise<LeaderboardBenchmarkOptions> => {
    const { data, error } = await apiClient.GET("/leaderboard/benchmarks")

    if (error) {
      throw new Error("Failed to fetch leaderboard benchmark options")
    }

    return data
  },

  getLeaderboard: async (
    leaderboardRequest: LeaderboardRequest
  ): Promise<LeaderboardRead> => {
    const { data, error } = await apiClient.POST("/leaderboard", {
      body: leaderboardRequest,
    })

    if (error) {
      throw new Error("Failed to fetch leaderboard")
    }

    return data
  },
}
