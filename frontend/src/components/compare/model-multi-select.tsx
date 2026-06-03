import { X } from "lucide-react"
import { useMemo } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import type { Model } from "@/data/models"

type ModelMultiSelectProps = {
  models: Model[]
  selectedModelIds: string[]
  onChange: (modelIds: string[]) => void
  maxSelected?: number
}

export function ModelMultiSelect({
  models,
  selectedModelIds,
  onChange,
  maxSelected = 5,
}: ModelMultiSelectProps) {
  const selectedModels = useMemo(
    () => models.filter((model) => selectedModelIds.includes(model.id)),
    [models, selectedModelIds]
  )
  const isAtLimit = selectedModelIds.length >= maxSelected

  const toggleModel = (modelId: string) => {
    if (!selectedModelIds.includes(modelId) && isAtLimit) {
      return
    }
    onChange(
      selectedModelIds.includes(modelId)
        ? selectedModelIds.filter((id) => id !== modelId)
        : [...selectedModelIds, modelId]
    )
  }

  return (
    <Card className="border border-border/60 bg-[#151515] text-white">
      <CardHeader className="gap-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-white">
            Models to compare
          </CardTitle>
          <Badge variant="outline" className="rounded-full px-2">
            {selectedModelIds.length}/{maxSelected}
          </Badge>
        </div>
        <p className="text-sm text-white/60">
          Select up to {maxSelected} models for side-by-side radar charts.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {selectedModels.length ? (
            selectedModels.map((model) => (
              <Badge
                key={model.id}
                variant="secondary"
                className="gap-1 rounded-full pr-1"
              >
                <span>{model.name}</span>
                <button
                  type="button"
                  className="grid size-4 place-content-center rounded-full text-white/70 transition hover:text-white"
                  onClick={() => toggleModel(model.id)}
                >
                  <X className="size-3" />
                </button>
              </Badge>
            ))
          ) : (
            <span className="text-xs text-white/50">
              Pick models to start a comparison.
            </span>
          )}
          {selectedModels.length ? (
            <Button
              variant="ghost"
              size="xs"
              className="h-6 px-2 text-xs text-white/70 hover:text-white"
              onClick={() => onChange([])}
            >
              Clear
            </Button>
          ) : null}
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          {models.map((model) => {
            const checked = selectedModelIds.includes(model.id)
            const disabled = !checked && isAtLimit

            return (
              <label
                key={model.id}
                htmlFor={`compare-${model.id}`}
                className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border/60 bg-[#1a1a1a] p-3 text-left transition hover:border-white/20 hover:bg-[#202020] data-disabled:cursor-not-allowed data-disabled:opacity-50"
                data-disabled={disabled}
              >
                <Checkbox
                  id={`compare-${model.id}`}
                  checked={checked}
                  disabled={disabled}
                  onCheckedChange={() => toggleModel(model.id)}
                />
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-white">
                    {model.name}
                  </span>
                  <span className="block text-xs text-white/60">
                    {model.description}
                  </span>
                </span>
              </label>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
