import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"

import { ModelCard } from "@/components/ModelCard"
import type { ModelRunStats } from "@/components/ModelCard"
import { ModelFilter } from "@/components/ModelFilter"

import { models, type Model } from "@/data/models"
import { providers } from "@/data/providers"

const getStatsForModel = (model: Model): ModelRunStats => {
  const sortedEvaluations = [...model.evaluations].sort((a, b) =>
    b.metadata.start.localeCompare(a.metadata.start)
  )
  const stats: ModelRunStats = {
    running: 0,
    completed: 0,
    failed: 0,
    queued: 0,
    total: model.evaluations.length,
    latestRunLabel: sortedEvaluations[0]?.metadata.start ?? "No runs",
  }

  model.evaluations.forEach((evaluation) => {
    stats[evaluation.evalStatus] += 1
  })

  return stats
}

const getStatsById = () => {
  return models.reduce<Record<string, ModelRunStats>>((acc, model) => {
    acc[model.id] = getStatsForModel(model)
    return acc
  }, {})
}

export function Models() {
  const navigate = useNavigate()
  const [selectedProvider, setSelectedProvider] = useState("All")

  const statsById = useMemo(() => getStatsById(), [])
  const providerOptions = providers

  const filteredModels = useMemo(() => {
    if (selectedProvider === "All") {
      return models
    }
    return models.filter((model) => model.provider === selectedProvider)
  }, [selectedProvider])

  return (
    <div className="flex h-full w-full flex-col gap-4 p-4 text-white md:p-6">
      <ModelFilter
        providers={providerOptions}
        selectedProvider={selectedProvider}
        onProviderChange={setSelectedProvider}
      />
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {filteredModels.map((model) => (
          <ModelCard
            key={model.id}
            model={model}
            stats={statsById[model.id]}
            onSelect={(modelId) => navigate(`/models/${modelId}`)}
          />
        ))}
      </div>
      {filteredModels.length === 0 && (
        <div className="rounded-xl border border-white/10 bg-[#181818] px-6 py-10 text-center text-sm text-zinc-400">
          No models found for this provider.
        </div>
      )}
    </div>
  )
}
