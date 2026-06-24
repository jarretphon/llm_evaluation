import { apiClient } from "@/services/api/client"

export const evaluationService = {
  getBenchmarkOptions: async () => {
    const { data, error } = await apiClient.GET("/evaluations/benchmarks")

    if (error) {
      throw new Error("Failed to fetch benchmark options")
    }

    return data
  },
}
