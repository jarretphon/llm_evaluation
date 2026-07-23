import { useQuery } from "@tanstack/react-query"

import { comparisonService } from "@/features/compare/services/comparisons"

export function useAvailableComparisonModels() {
  return useQuery({
    queryKey: ["comparison-models"],
    queryFn: comparisonService.getAvailableModels,
  })
}

export function useCompareModels(modelIds: string[]) {
  return useQuery({
    queryKey: ["comparison", modelIds],
    queryFn: () => comparisonService.compareModels({ model_ids: modelIds }),
    enabled: modelIds.length > 0,
  })
}
