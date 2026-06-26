import { apiClient } from "@/services/api/client"
import type {
  EvaluationCreate,
  EvaluationRead,
} from "@/features/evaluations/schemas/evaluations"

export const evaluationService = {
  getEvaluations: async (): Promise<EvaluationRead[]> => {
    const { data, error } = await apiClient.GET("/evaluations")

    if (error) {
      throw new Error("Failed to fetch evaluations")
    }

    return data
  },

  getBenchmarkOptions: async () => {
    const { data, error } = await apiClient.GET("/evaluations/benchmarks")

    if (error) {
      throw new Error("Failed to fetch benchmark options")
    }

    return data
  },

  getEvaluationById: async (evaluationId: string): Promise<EvaluationRead> => {
    const { data, error } = await apiClient.GET(
      "/evaluations/{evaluation_id}",
      {
        params: {
          path: { evaluation_id: evaluationId },
        },
      }
    )

    if (error) {
      throw new Error("Failed to fetch evaluation")
    }

    return data
  },

  createEvaluation: async (
    evaluationCreate: EvaluationCreate
  ): Promise<EvaluationRead> => {
    const { data, error } = await apiClient.POST("/evaluations", {
      body: evaluationCreate,
    })

    if (error) {
      throw new Error("Failed to create evaluation")
    }

    return data
  },

  startEvaluation: async (evaluationId: string): Promise<EvaluationRead> => {
    const { data, error } = await apiClient.POST(
      "/evaluations/{evaluation_id}",
      {
        params: {
          path: { evaluation_id: evaluationId },
        },
      }
    )

    if (error) {
      throw new Error("Failed to start evaluation")
    }

    return data
  },
}
