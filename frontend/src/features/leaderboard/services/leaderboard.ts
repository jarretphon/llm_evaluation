import { apiClient } from "@/services/api/client"
import type {
  LeaderboardRead,
  LeaderboardRequest,
} from "@/features/leaderboard/schemas/leaderboard"

export const leaderboardService = {
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
