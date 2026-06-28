import { BASE_URL } from "@/services/api/client"
import type {
  ComparisonRead,
  ComparisonRequest,
} from "@/features/compare/schemas/comparisons"

export const comparisonService = {
  compareModels: async (
    comparisonRequest: ComparisonRequest
  ): Promise<ComparisonRead> => {
    const response = await fetch(`${BASE_URL}/comparisons`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(comparisonRequest),
    })

    if (!response.ok) {
      const errorBody = await response.json().catch(() => undefined)
      const errorMessage = errorBody?.detail ?? "Failed to compare models."

      throw new Error(errorMessage)
    }

    return response.json()
  },
}
