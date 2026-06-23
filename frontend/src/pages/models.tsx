import { useState } from "react"
import { useNavigate } from "react-router-dom"

import { ModelCard } from "@/features/models/components/ModelCard"
import { ModelFilter } from "@/features/models/components/ModelFilter"

import { providers } from "@/data/providers"
import { useGetModels } from "@/features/models/hooks/queries/useModels"

// const getStatsForModel = (model: Model): ModelRunStats => {
//   const sortedEvaluations = [...model.evaluations].sort((a, b) =>
//     b.metadata.start.localeCompare(a.metadata.start)
//   )
//   const stats: ModelRunStats = {
//     running: 0,
//     completed: 0,
//     failed: 0,
//     queued: 0,
//     total: model.evaluations.length,
//     latestRunLabel: sortedEvaluations[0]?.metadata.start ?? "No runs",
//   }

//   model.evaluations.forEach((evaluation) => {
//     stats[evaluation.evalStatus] += 1
//   })

//   return stats
// }

// const getStatsById = () => {
//   return models.reduce<Record<string, ModelRunStats>>((acc, model) => {
//     acc[model.id] = getStatsForModel(model)
//     return acc
//   }, {})
// }

export function Models() {
  const navigate = useNavigate()
  const [selectedProvider, setSelectedProvider] = useState("All")

  const { data, isPending, error } = useGetModels()

  // const statsById = useMemo(() => getStatsById(), [])

  if (isPending) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-white/80" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-white/10 bg-[#181818] px-6 py-10 text-center text-sm text-red-500">
        Failed to load models: {error.message}
      </div>
    )
  }

  const providerOptions = providers

  return (
    <div className="flex h-full w-full flex-col gap-4 p-4 text-white md:p-6">
      <ModelFilter
        providers={providerOptions}
        selectedProvider={selectedProvider}
        onProviderChange={setSelectedProvider}
      />
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {data.map((model) => (
          <ModelCard
            key={model.id}
            model={model}
            onSelect={(modelId) => navigate(`/models/${modelId}`)}
          />
        ))}
      </div>
      {data.length === 0 && !error && (
        <div className="rounded-xl border border-white/10 bg-[#181818] px-6 py-10 text-center text-sm text-zinc-400">
          No models found for this provider.
        </div>
      )}
    </div>
  )
}
