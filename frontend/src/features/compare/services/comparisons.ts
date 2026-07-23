import { apiClient } from "@/services/api/client"
import type {
  ComparisonModelOption,
  ComparisonRead,
  ComparisonRequest,
} from "@/features/compare/schemas/comparisons"

export const comparisonService = {
  getAvailableModels: async (): Promise<ComparisonModelOption[]> => {
    const { data, error } = await apiClient.GET("/llms")

    if (error) {
      throw new Error("Failed to fetch comparison models")
    }

    return data
  },

  compareModels: async (
    comparisonRequest: ComparisonRequest
  ): Promise<ComparisonRead> => {
    const { data, error } = await apiClient.POST("/comparisons", {
      body: comparisonRequest,
    })

    if (error) {
      throw new Error("Failed to compare models")
    }

    return data
  },
}
