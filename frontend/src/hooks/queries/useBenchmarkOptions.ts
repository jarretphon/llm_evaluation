import { useEffect } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"

import { benchmarkOptionsService } from "@/services/benchmark-options/benchmarkOptions"

export const benchmarkOptionsQueryKey = ["benchmark-options"] as const
export const benchmarkOptionsStaleTimeMs = 1000 * 60 * 30
export const benchmarkOptionsGcTimeMs = 1000 * 60 * 60

export function useBenchmarkOptions() {
  return useQuery({
    queryKey: benchmarkOptionsQueryKey,
    queryFn: benchmarkOptionsService.getBenchmarkOptions,
    staleTime: benchmarkOptionsStaleTimeMs,
    gcTime: benchmarkOptionsGcTimeMs,
  })
}

export function usePrefetchBenchmarkOptions() {
  const queryClient = useQueryClient()

  useEffect(() => {
    queryClient.prefetchQuery({
      queryKey: benchmarkOptionsQueryKey,
      queryFn: benchmarkOptionsService.getBenchmarkOptions,
      staleTime: benchmarkOptionsStaleTimeMs,
      gcTime: benchmarkOptionsGcTimeMs,
    })
  }, [queryClient])
}
