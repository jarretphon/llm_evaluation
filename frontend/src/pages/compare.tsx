import { useMemo, useState } from "react"

import { ModelMultiSelect } from "@/components/compare/model-multi-select"
import { ModelRadarChart } from "@/components/compare/model-radar-chart"
import { benchmarkCategories } from "@/data/benchmark-categories"
import { models } from "@/data/models"

export function Compare() {
  const [selectedModelIds, setSelectedModelIds] = useState(() =>
    models.slice(0, 3).map((model) => model.id)
  )

  const selectedModels = useMemo(
    () => models.filter((model) => selectedModelIds.includes(model.id)),
    [selectedModelIds]
  )

  return (
    <div className="flex h-full w-full flex-col gap-6 p-4 text-white md:p-6">
      <div className="space-y-2">
        <p className="text-xs font-semibold tracking-[0.28em] text-white/50 uppercase">
          Side by side insights
        </p>
        <h1 className="text-2xl font-semibold md:text-3xl">Compare models</h1>
        <p className="text-sm text-white/60">
          Select up to five models to compare category benchmarks.
        </p>
      </div>

      <div className="grid gap-6">
        <ModelMultiSelect
          models={models}
          selectedModelIds={selectedModelIds}
          onChange={setSelectedModelIds}
        />

        <div className="grid gap-4 md:grid-cols-2">
          {benchmarkCategories.map((category) => (
            <ModelRadarChart
              key={category.id}
              category={category}
              models={selectedModels}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
