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

type FileTreeItem = { name: string; subgroups: string[] }

export function NewEvalDialog({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
}) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())

  const benchmarks: FileTreeItem[] = [
    {
      name: "mmlu",
      subgroups: ["mmlu_stem", "mmlu_social_sciences", "mmlu_humanities"],
    },
    {
      name: "afrimgsm",
      subgroups: [
        "afrimgsm-irokobench",
        "afrimgsm-cot-irokobench",
        "afrimgsm-irokobench-translation",
      ],
    },
    {
      name: "gsm8k",
      subgroups: [
        "use-media-query.ts",
        "use-debounce.ts",
        "use-local-storage.ts",
      ],
    },
    {
      name: "zhomblip",
      subgroups: ["zhomblip-test1", "zhomblip-test2", "zhomblip-test3"],
    },
    {
      name: "public",
      subgroups: ["favicon.ico", "logo.svg", "images"],
    },
  ]

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return benchmarks
    return benchmarks.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.subgroups.some((g) => g.toLowerCase().includes(q))
    )
  }, [searchQuery])

  const selectAll = () => {
    const next = new Set<string>()
    benchmarks.forEach((b) => {
      if (b.subgroups.length === 0) {
        next.add(b.name)
      } else {
        b.subgroups.forEach((g) => next.add(g))
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

          <NewEvaluationForm
            benchmarks={filtered}
            selectedItems={selectedItems}
            setSelectedItems={setSelectedItems}
          />
        </div>

        <DialogFooter>
          <DialogClose>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={() => setIsOpen(false)}>Start Evaluation</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
