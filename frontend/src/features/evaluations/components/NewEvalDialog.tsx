import { useMemo, useState } from "react"
import { NEW_EVAL_DIALOG_TEXTS } from "@/features/evaluations/components/NewEvalDialog.texts"
import { NewEvaluationForm } from "@/features/evaluations/components/forms/NewEvaluationForm"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { SearchBar } from "@/features/evaluations/components/SearchBar"
import { Separator } from "@/components/ui/separator"

import { useGetBenchmarkOptions } from "@/features/evaluations/hooks/queries/useEvaluations"
import type { components } from "@/types/schema"

type Model = components["schemas"]["LLMRead"]

const NEW_EVALUATION_FORM_ID = "new-evaluation-form"

export function NewEvalDialog({
  isOpen,
  setIsOpen,
  model,
}: {
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  model?: Model
}) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())

  const { data, isPending, error } = useGetBenchmarkOptions()

  const benchmarks = useMemo(() => Object.entries(data || {}), [data])

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return benchmarks
    return benchmarks.filter(
      ([name, subgroups]) =>
        name.toLowerCase().includes(q) ||
        subgroups.some((group) => group.toLowerCase().includes(q))
    )
  }, [benchmarks, searchQuery])

  if (isPending) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error.message}</div>
  }

  const selectAll = () => {
    const next = new Set<string>()
    benchmarks.forEach(([name, subgroups]) => {
      if (subgroups.length === 0) {
        next.add(name)
      } else {
        subgroups.forEach((g) => next.add(g))
      }
    })
    setSelectedItems(next)
  }

  const clearAll = () => setSelectedItems(new Set<string>())

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-150">
        <DialogHeader>
          <DialogTitle>{NEW_EVAL_DIALOG_TEXTS.title}</DialogTitle>
          <DialogDescription>
            {NEW_EVAL_DIALOG_TEXTS.description}
          </DialogDescription>
        </DialogHeader>

        <div>
          <ButtonGroup className="mb-2 flex w-full">
            <ButtonGroup className="flex-1">
              <SearchBar value={searchQuery} onChange={setSearchQuery} />
            </ButtonGroup>
            <ButtonGroup>
              <Button variant="outline" onClick={selectAll}>
                Select All
              </Button>
            </ButtonGroup>
            <ButtonGroup>
              <Button variant="outline" onClick={clearAll}>
                Clear
              </Button>
            </ButtonGroup>
          </ButtonGroup>

          <Separator />

          {model ? (
            <NewEvaluationForm
              formId={NEW_EVALUATION_FORM_ID}
              model={model}
              benchmarks={filtered}
              selectedItems={selectedItems}
              setSelectedItems={setSelectedItems}
              onSubmitSuccess={() => {
                setSelectedItems(new Set<string>())
                setIsOpen(false)
              }}
            />
          ) : (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Select a model before starting an evaluation.
            </div>
          )}
        </div>

        <DialogFooter>
          <DialogClose>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" form={NEW_EVALUATION_FORM_ID} disabled={!model}>
            Start Evaluation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
