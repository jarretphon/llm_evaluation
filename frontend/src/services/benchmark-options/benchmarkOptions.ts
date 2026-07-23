import { apiClient } from "@/services/api/client"

export type BenchmarkOptions = Record<string, string[]>

export const benchmarkOptionsService = {
  getBenchmarkOptions: async (): Promise<BenchmarkOptions> => {
    const { data, error } = await apiClient.GET("/evaluations/benchmarks")

    if (error) {
      throw new Error("Failed to fetch benchmark options")
    }

    return data
  },
}
