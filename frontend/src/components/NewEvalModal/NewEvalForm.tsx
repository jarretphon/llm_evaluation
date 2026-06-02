import {
  Field,
  FieldContent,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { models, type Model } from "@/data/models"
import { benchmarks, type Benchmark } from "@/data/benchmarks"
import { Checkbox } from "@/components/ui/checkbox"
import { useState } from "react"

const availableModels = models
const benchmarkOptions = benchmarks

export function NewEvalForm() {
  return (
    <FieldGroup className="px-2 sm:px-0">
      <Field>
        <FieldLabel htmlFor="evaluation-model">
          <FieldTitle>Model</FieldTitle>
        </FieldLabel>
        <FieldContent>
          <ModelSelect models={availableModels} />
        </FieldContent>
      </Field>

      <Field>
        <FieldLabel>
          <FieldTitle>Benchmarks</FieldTitle>
        </FieldLabel>
        <FieldContent>
          <BenchmarkMultiSelect benchmarks={benchmarkOptions} />
        </FieldContent>
      </Field>
    </FieldGroup>
  )
}

const ModelSelect = ({ models }: { models: Model[] }) => {
  const [selectedModelId, setSelectedModelId] = useState(models[0].name)

  return (
    <Select
      value={selectedModelId}
      onValueChange={(value) => {
        if (value) {
          setSelectedModelId(value)
        }
      }}
    >
      <SelectTrigger className="w-full cursor-pointer rounded-md">
        <SelectValue placeholder="Select a model" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {models.map((model: Model) => (
            <SelectItem key={model.id} value={model.name}>
              <span className="flex flex-col items-start gap-0.5">
                <span>{model.name}</span>
                <span className="text-xs text-muted-foreground">
                  {model.description}
                </span>
              </span>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

const BenchmarkMultiSelect = ({ benchmarks }: { benchmarks: Benchmark[] }) => {
  const [selectedBenchmarkIds, setSelectedBenchmarkIds] = useState<string[]>([])

  const toggleBenchmark = (benchmarkId: string) => {
    setSelectedBenchmarkIds((current) =>
      current.includes(benchmarkId)
        ? current.filter((id) => id !== benchmarkId)
        : [...current, benchmarkId]
    )
  }

  return (
    <div className="recent-activity-scroll grid max-h-95 grid-cols-1 gap-2 overflow-y-auto border-b pr-1 sm:grid-cols-2 sm:pr-2">
      {benchmarks.map((benchmark) => {
        const checked = selectedBenchmarkIds.includes(benchmark.id)
        return (
          <label
            key={benchmark.id}
            htmlFor={benchmark.id}
            className="flex cursor-pointer items-start gap-3 rounded-xl border border-border/60 bg-background/60 p-3 transition-colors hover:bg-muted/50"
          >
            <Checkbox
              id={benchmark.id}
              checked={checked}
              onCheckedChange={() => toggleBenchmark(benchmark.id)}
            />
            <span>
              <span className="block text-sm font-medium text-foreground">
                {benchmark.name}
              </span>
              <span className="block text-xs text-muted-foreground">
                {benchmark.description}
              </span>
            </span>
          </label>
        )
      })}
    </div>
  )
}
