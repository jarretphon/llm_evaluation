import { useMemo, useState } from "react"

import { ModelMultiSelect } from "@/components/compare/model-multi-select"
import { ModelRadarChart } from "@/components/compare/model-radar-chart"
import { benchmarkCategories } from "@/data/benchmark-categories"
import { models } from "@/data/models"

export function Compare() {
  const [selectedModelIds, setSelectedModelIds] = useState<string[]>([])

  const selectedModels = useMemo(
    () => models.filter((model) => selectedModelIds.includes(model.id)),
    [selectedModelIds]
  )

  return (
    <div className="flex h-full w-full flex-col gap-6 p-4 text-white md:p-6">
      <div className="grid gap-6">
        <ModelMultiSelect
          models={models}
          selectedModelIds={selectedModelIds}
          onChange={setSelectedModelIds}
        />

        <div className="grid gap-4 lg:grid-cols-2">
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
