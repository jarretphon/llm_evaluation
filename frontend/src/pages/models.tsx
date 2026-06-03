import { useMemo } from "react"
import { useNavigate } from "react-router-dom"

import { ModelCard } from "@/components/models/model-card"

import type { ModelRunStats } from "@/components/models/model-card"
import { models, type Model } from "@/data/models"

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
  const statsById = useMemo(() => getStatsById(), [])

  return (
    <div className="flex h-full w-full flex-col gap-6 p-4 text-white md:p-6">
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {models.map((model) => (
          <ModelCard
            key={model.id}
            model={model}
            stats={statsById[model.id]}
            onSelect={(modelId) => navigate(`/models/${modelId}`)}
          />
        ))}
      </div>
    </div>
  )
}
