import { useCompareModels } from "@/features/compare/hooks/queries/useComparisons"
import { BenchmarkChart } from "@/features/compare/components/BenchmarkChart"
import { ChartGridEmpty } from "./ChartGridEmpty"

export function BenchmarkChartGrid({
  selectedModelIds,
}: {
  selectedModelIds: string[]
}) {
  if (selectedModelIds.length === 0) {
    return <ChartGridEmpty />
  }

  const { data, isPending, error } = useCompareModels(selectedModelIds)

  if (isPending) {
    return <div>Loading comparison...</div>
  }

  if (error) {
    return <div>Error loading comparison: {error.message}</div>
  }

  const comparisonBenchmarks = Object.entries(data)

  return (
    <>
      {comparisonBenchmarks.length > 0 && (
        <div className="grid gap-4 xl:grid-cols-3">
          {comparisonBenchmarks.map(([benchmarkName, metrics]) => (
            <BenchmarkChart
              key={benchmarkName}
              benchmarkName={benchmarkName}
              metrics={metrics}
            />
          ))}
        </div>
      )}
    </>
  )
}
