import { apiClient } from "@/services/api/client"
import type { components } from "@/types/schema"

type LLMCreate = components["schemas"]["LLMCreate"]

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

  createModel: async (modelData: LLMCreate) => {
    const { data, error } = await apiClient.POST("/llms", {
      body: modelData,
    })

    if (error) {
      throw new Error(`Failed to create model: ${error.detail?.[0]?.msg}`)
    }

    return data
  },

  editModel: async (id: string, modelData: Partial<LLMCreate>) => {
    const { data, error } = await apiClient.PATCH("/llms/{llm_id}", {
      params: {
        path: { llm_id: id },
      },
      body: modelData,
    })

    if (error) {
      throw new Error(`Failed to update model: ${error.detail?.[0]?.msg}`)
    }

    return data
  },

  deleteModel: async (id: string) => {
    const { error } = await apiClient.DELETE("/llms/{llm_id}", {
      params: {
        path: { llm_id: id },
      },
    })

    if (error) {
      throw new Error(`Failed to delete model: ${error.detail?.[0]?.msg}`)
    }
  },
}
