import { useState } from "react"
import { BenchmarkSelect } from "@/features/compare/components/BenchmarkSelect"
import { BenchmarkChartGrid } from "@/features/compare/components/BenchmarkChartGrid"

export function Compare() {
  const [selectedModelIds, setSelectedModelIds] = useState<string[]>([])

  return (
    <div className="mx-auto flex h-full w-full max-w-360 flex-col gap-6 p-4 text-foreground md:p-6">
      <BenchmarkSelect
        selectedModelIds={selectedModelIds}
        onChange={setSelectedModelIds}
      />
      <BenchmarkChartGrid selectedModelIds={selectedModelIds} />
    </div>
  )
}
