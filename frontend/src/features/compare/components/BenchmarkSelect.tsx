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
import { useAvailableComparisonModels } from "@/features/compare/hooks/queries/useComparisons"

type BenchmarkSelectProps = {
  selectedModelIds: string[]
  onChange: (modelIds: string[]) => void
  maxSelected?: number
}

export function BenchmarkSelect({
  selectedModelIds,
  onChange,
  maxSelected = 5,
}: BenchmarkSelectProps) {
  const handleValueChange = (nextModelIds: string[]) => {
    onChange(nextModelIds.slice(0, maxSelected))
  }

  const { data, isPending, error } = useAvailableComparisonModels()

  if (isPending) {
    return <div>Loading models...</div>
  }

  if (error) {
    return <div>Error loading models: {error.message}</div>
  }

  return (
    <Card className="rounded-lg border border-border/60 bg-card text-card-foreground">
      <CardHeader className="gap-2">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-lg text-foreground">
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
              {data.map((model) => (
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
