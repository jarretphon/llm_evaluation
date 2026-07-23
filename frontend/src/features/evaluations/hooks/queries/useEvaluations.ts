import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { evaluationService } from "@/features/evaluations/services/evaluations"
import type { EvaluationCreate } from "@/features/evaluations/schemas/evaluations"
import { evaluationQueryKeys } from "@/features/evaluations/hooks/queries/queryKeys"
import { modelQueryKeys } from "@/hooks/queries/queryKeys"

export function useGetEvaluations() {
  return useQuery({
    queryKey: evaluationQueryKeys.all,
    queryFn: evaluationService.getEvaluations,
  })
}

export function useGetEvaluationById({
  evaluationId,
  enabled = true,
}: {
  evaluationId: string
  enabled?: boolean
}) {
  return useQuery({
    queryKey: evaluationQueryKeys.detail(evaluationId),
    queryFn: () => evaluationService.getEvaluationById(evaluationId),
    enabled: enabled && !!evaluationId,
  })
}

export function useCreateEvaluation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: EvaluationCreate) =>
      evaluationService.createEvaluation(data),
    onSuccess: (createdEvaluation, evaluationCreate) => {
      queryClient.invalidateQueries({ queryKey: evaluationQueryKeys.all })
      queryClient.invalidateQueries({
        queryKey: evaluationQueryKeys.detail(createdEvaluation.id),
      })
      queryClient.invalidateQueries({
        queryKey: modelQueryKeys.detail(evaluationCreate.model_id),
      })
      queryClient.invalidateQueries({
        queryKey: modelQueryKeys.summaryCards(),
      })
    },
  })
}
