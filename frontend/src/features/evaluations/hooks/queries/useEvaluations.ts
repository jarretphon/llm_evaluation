import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { evaluationService } from "@/features/evaluations/services/evaluations"
import type { EvaluationCreate } from "@/features/evaluations/schemas/evaluations"

export function useGetBenchmarkOptions() {
  return useQuery({
    queryKey: ["benchmarks"],
    queryFn: evaluationService.getBenchmarkOptions,
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
    queryKey: ["evaluation", evaluationId],
    queryFn: () => evaluationService.getEvaluationById(evaluationId),
    enabled: enabled && !!evaluationId,
    refetchInterval: (query) => {
      const evaluation = query.state.data
      const progress = evaluation?.metadata_entry.progress ?? 0
      const status = evaluation?.metadata_entry.evaluation_status
      const isIncomplete = progress < 100
      const isRunningOrQueued = status === "running" || status === "queued"

      return isIncomplete && isRunningOrQueued ? 1500 : false
    },
  })
}

export function useCreateEvaluation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: EvaluationCreate) =>
      evaluationService.createEvaluation(data),
    onSuccess: (createdEvaluation, evaluationCreate) => {
      queryClient.invalidateQueries({ queryKey: ["evaluations"] })
      queryClient.invalidateQueries({
        queryKey: ["model", evaluationCreate.model_id],
      })
      queryClient.invalidateQueries({
        queryKey: ["evaluation", createdEvaluation.id],
      })
    },
  })
}
