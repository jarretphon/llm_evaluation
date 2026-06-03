import { Card, CardContent } from "@/components/ui/card"
import type { Model } from "@/data/models"
import { ModelCard, type ModelRunStats } from "@/components/models/model-card"

type ModelCardGridProps = {
  models: Model[]
  statsById: Record<string, ModelRunStats>
  onSelectModel: (modelId: string) => void
}

export function ModelCardGrid({
  models,
  statsById,
  onSelectModel,
}: ModelCardGridProps) {
  if (!models.length) {
    return (
      <Card className="border border-border/60 bg-[#151515] text-white">
        <CardContent className="py-10 text-center text-sm text-white/60">
          No models match the current filters.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {models.map((model) => (
        <ModelCard
          key={model.id}
          model={model}
          stats={statsById[model.id]}
          onSelect={onSelectModel}
        />
      ))}
    </div>
  )
}
