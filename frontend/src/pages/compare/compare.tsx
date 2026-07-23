import { useState } from "react"
import { BenchmarkSelect } from "@/features/compare/components/BenchmarkSelect"
import { BenchmarkChartGrid } from "@/features/compare/components/BenchmarkChartGrid"

export function Compare() {
  const [selectedModelIds, setSelectedModelIds] = useState<string[]>([])

  return (
    <div className="mx-auto flex h-full w-full max-w-360 flex-col gap-4 px-4 pt-4 pb-1 text-foreground md:pt-6">
      <BenchmarkSelect
        selectedModelIds={selectedModelIds}
        onChange={setSelectedModelIds}
      />
      <BenchmarkChartGrid selectedModelIds={selectedModelIds} />
    </div>
  )
}
