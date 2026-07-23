import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { modelService } from "@/features/models/services/models"
import type { LLMCreate, LLMUpdate } from "@/features/models/schemas/models"
import { modelQueryKeys } from "@/features/models/hooks/queries/queryKeys"

export function useGetModelSummaryCards() {
  return useQuery({
    queryKey: modelQueryKeys.summaryCards(),
    queryFn: modelService.getModelSummaryCards,
  })
}

export function useGetModels() {
  return useQuery({
    queryKey: modelQueryKeys.all,
    queryFn: modelService.getAllModels,
  })
}

export function useGetModelById({ modelId }: { modelId: string }) {
  return useQuery({
    queryKey: modelQueryKeys.detail(modelId),
    queryFn: () => modelService.getModelById(modelId),
    enabled: !!modelId,
  })
}

export function useCreateModel() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: LLMCreate) => modelService.createModel(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: modelQueryKeys.all,
      })
      queryClient.invalidateQueries({
        queryKey: modelQueryKeys.summaryCards(),
      })
    },
  })
}

export function useEditModel({ modelId }: { modelId: string }) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: LLMUpdate) => modelService.editModel(modelId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: modelQueryKeys.all })
      queryClient.invalidateQueries({ queryKey: modelQueryKeys.summaryCards() })
    },
  })
}

export function useDeleteModel() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (modelId: string) => modelService.deleteModel(modelId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: modelQueryKeys.all,
      })
      queryClient.invalidateQueries({
        queryKey: modelQueryKeys.summaryCards(),
      })
    },
  })
}
