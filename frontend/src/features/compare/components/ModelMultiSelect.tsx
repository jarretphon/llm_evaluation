import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectGroup,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue,
} from "@/components/ui/multi-select"
import type { components } from "@/types/schema"

type Model = Pick<components["schemas"]["LLMRead"], "id" | "name">

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
  const handleValueChange = (nextModelIds: string[]) => {
    onChange(nextModelIds.slice(0, maxSelected))
  }

  return (
    <Card className="border border-border/60 bg-[#151515] text-white">
      <CardHeader className="gap-2">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-lg text-white">
            Select models to compare
          </CardTitle>
          <Badge variant="outline" className="rounded-full px-2">
            {selectedModelIds.length}/{maxSelected}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <MultiSelect
          values={selectedModelIds}
          onValuesChange={handleValueChange}
        >
          <MultiSelectTrigger className="w-full max-w-100">
            <MultiSelectValue placeholder="Select models" />
          </MultiSelectTrigger>
          <MultiSelectContent>
            <MultiSelectGroup>
              {models.map((model) => (
                <MultiSelectItem key={model.id} value={model.id}>
                  {model.name}
                </MultiSelectItem>
              ))}
            </MultiSelectGroup>
          </MultiSelectContent>
        </MultiSelect>
      </CardContent>
    </Card>
  )
}
