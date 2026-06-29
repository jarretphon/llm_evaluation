import { apiClient } from "@/services/api/client"
import type {
  ComparisonRead,
  ComparisonRequest,
} from "@/features/compare/schemas/comparisons"

export const comparisonService = {
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
