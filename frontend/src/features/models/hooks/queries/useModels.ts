import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { modelService } from "@/features/models/services/models"
import type { LLMCreate } from "@/features/models/schemas/models"

export function useGetModels() {
  return useQuery({
    queryKey: ["models"],
    queryFn: modelService.getAllModels,
  })
}

export function useGetModelById({ modelId }: { modelId: string }) {
  return useQuery({
    queryKey: ["model", modelId],
    queryFn: () => modelService.getModelById(modelId),
    enabled: !!modelId,
  })
}

export function useCreateModel() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: LLMCreate) => modelService.createModel(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["models"] })
    },
  })
}

export function useEditModel({ modelId }: { modelId: string }) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: LLMCreate) => modelService.editModel(modelId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["models"] })
    },
  })
}

export function useDeleteModel() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (modelId: string) => modelService.deleteModel(modelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["models"] })
    },
  })
}
