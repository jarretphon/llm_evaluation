import { useQuery } from "@tanstack/react-query"

import { comparisonService } from "@/features/compare/services/comparisons"
import { comparisonQueryKeys } from "@/features/compare/hooks/queries/queryKeys"

export function useAvailableComparisonModels() {
  return useQuery({
    queryKey: comparisonQueryKeys.availableModels(),
    queryFn: comparisonService.getAvailableModels,
  })
}

export function useCompareModels(modelIds: string[]) {
  return useQuery({
    queryKey: comparisonQueryKeys.result(modelIds),
    queryFn: () => comparisonService.compareModels({ model_ids: modelIds }),
    enabled: modelIds.length > 0,
  })
}
