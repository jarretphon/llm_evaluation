import { apiClient } from "@/services/api/client"

export const modelService = {
  getAllModels: async () => {
    const { data, error } = await apiClient.GET("/llms")

    if (error) {
      throw new Error(`Failed to fetch models: ${error.detail?.[0]?.msg}`)
    }

    return data
  },

  getModelById: async (id: string) => {
    const { data, error } = await apiClient.GET("/llms/{llm_id}", {
      params: {
        path: { llm_id: id },
      },
    })

    if (error) {
      throw new Error(`Failed to fetch model: ${error.detail?.[0]?.msg}`)
    }

    return data
  },
}
