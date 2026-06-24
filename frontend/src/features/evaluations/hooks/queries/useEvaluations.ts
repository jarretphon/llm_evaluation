import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { evaluationService } from "@/features/evaluations/services/evaluations"

export function useGetBenchmarkOptions() {
  return useQuery({
    queryKey: ["benchmarks"],
    queryFn: evaluationService.getBenchmarkOptions,
  })
}
