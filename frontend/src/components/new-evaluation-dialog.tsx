"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
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
import { useIsMobile } from "@/hooks/use-mobile.ts"
import { models, type Model } from "@/data/models"
import { benchmarks, type Benchmark } from "@/data/benchmarks"

const availableModels: Model[] = models
const benchmarkOptions: Benchmark[] = benchmarks

const HeaderText = "Start New Evaluation"
const DescriptionText =
  "Select a model and the benchmarks you want to include in this evaluation run."
const primaryActionText = "Start Evaluation"
const secondaryActionText = "Cancel"

interface DialogProps {
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
}

function EvaluationFormBody({
  selectedModelId,
  setSelectedModelId,
  selectedBenchmarkIds,
  toggleBenchmark,
}: {
  selectedModelId: string
  setSelectedModelId: (value: string) => void
  selectedBenchmarkIds: string[]
  toggleBenchmark: (benchmarkId: string) => void
}) {
  return (
    <FieldGroup className="px-2 sm:px-0">
      <Field>
        <FieldLabel htmlFor="evaluation-model">
          <FieldTitle>Model</FieldTitle>
        </FieldLabel>
        <FieldContent>
          <Select
            value={selectedModelId}
            onValueChange={(value) => {
              if (value) {
                setSelectedModelId(value)
              }
            }}
          >
            <SelectTrigger
              id="evaluation-model"
              className="w-full cursor-pointer rounded-md"
            >
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {availableModels.map((model) => (
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
        </FieldContent>
      </Field>

      <Field>
        <FieldLabel>
          <FieldTitle>Benchmarks</FieldTitle>
        </FieldLabel>
        <FieldContent>
          <div className="recent-activity-scroll max-h-95 overflow-y-auto border-b pr-1 sm:pr-2">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {benchmarkOptions.map((benchmark) => {
                const checked = selectedBenchmarkIds.includes(benchmark.id)

                return (
                  <label
                    key={benchmark.id}
                    htmlFor={benchmark.id}
                    className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border/60 bg-background/60 p-3 transition-colors hover:bg-muted/50"
                  >
                    <Checkbox
                      id={benchmark.id}
                      checked={checked}
                      onCheckedChange={() => toggleBenchmark(benchmark.id)}
                    />
                    <span className="min-w-0">
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
          </div>
        </FieldContent>
      </Field>
    </FieldGroup>
  )
}

export function NewEvaluationDialog({ isOpen, setIsOpen }: DialogProps) {
  const isMobile = useIsMobile()
  const [selectedModelId, setSelectedModelId] = useState(availableModels[0].id)
  const [selectedBenchmarkIds, setSelectedBenchmarkIds] = useState<string[]>([
    "gsm8k",
    "mmlu",
    "truthfulqa",
  ])

  const toggleBenchmark = (benchmarkId: string) => {
    setSelectedBenchmarkIds((current) =>
      current.includes(benchmarkId)
        ? current.filter((id) => id !== benchmarkId)
        : [...current, benchmarkId]
    )
  }

  const handleSubmit = () => {
    setIsOpen(false)
  }

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <form>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>{HeaderText}</DrawerTitle>
              <DrawerDescription>{DescriptionText}</DrawerDescription>
            </DrawerHeader>
            <EvaluationFormBody
              selectedModelId={selectedModelId}
              setSelectedModelId={setSelectedModelId}
              selectedBenchmarkIds={selectedBenchmarkIds}
              toggleBenchmark={toggleBenchmark}
            />
            <DrawerFooter className="py-3">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 rounded-lg"
                >
                  {secondaryActionText}
                </Button>
                <Button
                  type="button"
                  onClick={handleSubmit}
                  className="flex-1 rounded-lg"
                >
                  {primaryActionText}
                </Button>
              </div>
            </DrawerFooter>
          </DrawerContent>
        </form>
      </Drawer>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <form>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{HeaderText}</DialogTitle>
            <DialogDescription>{DescriptionText}</DialogDescription>
          </DialogHeader>
          <EvaluationFormBody
            selectedModelId={selectedModelId}
            setSelectedModelId={setSelectedModelId}
            selectedBenchmarkIds={selectedBenchmarkIds}
            toggleBenchmark={toggleBenchmark}
          />
          <DialogFooter>
            <DialogClose>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="rounded-lg"
              >
                {secondaryActionText}
              </Button>
            </DialogClose>
            <Button type="button" onClick={handleSubmit} className="rounded-lg">
              {primaryActionText}
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  )
}
