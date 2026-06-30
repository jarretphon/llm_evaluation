import { useState } from "react"

import { Card, CardContent } from "@/components/ui/card"
import { BenchmarkChart } from "@/features/compare/components/BenchmarkChart"
import { ModelMultiSelect } from "@/features/compare/components/ModelMultiSelect"
import { useCompareModels } from "@/features/compare/hooks/queries/useComparisons"
import { useGetModels } from "@/features/models/hooks/queries/useModels"

export function Compare() {
  const [selectedModelIds, setSelectedModelIds] = useState<string[]>([])
  const {
    data: models = [],
    isPending: isModelsPending,
    error: modelsError,
  } = useGetModels()
  const {
    data: comparison,
    isFetching: isComparisonFetching,
    error: comparisonError,
  } = useCompareModels(selectedModelIds)

  const comparisonBenchmarks = Object.entries(comparison ?? {})

  return (
    <div className="flex h-full w-full flex-col gap-6 p-4 text-white md:p-6">
      <ModelMultiSelect
        models={models}
        selectedModelIds={selectedModelIds}
        onChange={setSelectedModelIds}
      />

      {isModelsPending && <CompareMessage message="Loading models..." />}

      {modelsError && (
        <CompareMessage
          message={`Failed to load models: ${modelsError.message}`}
        />
      )}

      {selectedModelIds.length === 0 && !isModelsPending && (
        <CompareMessage message="Select models to compare their latest completed evaluations." />
      )}

      {selectedModelIds.length > 0 && isComparisonFetching && (
        <CompareMessage message="Computing comparison..." />
      )}

      {comparisonError && (
        <CompareMessage
          message={`Failed to compare models: ${comparisonError.message}`}
        />
      )}

      {comparison && comparisonBenchmarks.length === 0 && (
        <CompareMessage message="No completed benchmark results were found for the selected models." />
      )}

      {comparisonBenchmarks.length > 0 && (
        <div className="grid gap-4 xl:grid-cols-2">
          {comparisonBenchmarks.map(([benchmarkName, metrics]) => (
            <BenchmarkChart
              key={benchmarkName}
              benchmarkName={benchmarkName}
              metrics={metrics}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function CompareMessage({ message }: { message: string }) {
  return (
    <Card className="border border-border/60 bg-[#151515] text-white">
      <CardContent className="py-8 text-sm text-white/60">
        {message}
      </CardContent>
    </Card>
  )
}
