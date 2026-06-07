import { useNavigate, useParams } from "react-router-dom"
import { useState } from "react"
import { ArrowLeft, CirclePlay } from "lucide-react"

import { CurrentEvalDialog } from "@/components/CurrentEvalDialog/CurrentEvalDialog"
import { NewEvalDialog } from "@/components/NewEvalDialog/NewEvalDialog"
import { ModelEvaluationPanel } from "@/components/EvaluationPanel"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { EvaluationRecord } from "@/data/evaluations"
import { models, type Model } from "@/data/models"

type EvaluationWithModel = EvaluationRecord & {
  model: Model
}

const attachModel = (
  model: Model,
  evaluation: EvaluationRecord
): EvaluationWithModel => ({
  ...evaluation,
  model,
})

const EmptyState = () => {
  const navigate = useNavigate()

  return (
    <div className="flex h-full w-full flex-col gap-4 p-4 text-white md:p-6">
      <Button
        variant="outline"
        className="w-fit rounded-md"
        onClick={() => navigate("/models")}
      >
        <ArrowLeft className="size-4" />
      </Button>
      <Card className="rounded-lg border border-border/60 bg-[#151515] text-white">
        <CardContent className="py-10 text-sm text-white/60">
          This model could not be found.
        </CardContent>
      </Card>
    </div>
  )
}

export function ModelDetails() {
  const { modelId } = useParams()
  const navigate = useNavigate()
  const [isNewEvalOpen, setIsNewEvalOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [activeEvaluation, setActiveEvaluation] =
    useState<EvaluationWithModel | null>(null)
  const model = models.find((item) => item.id === modelId) ?? null

  if (!model) {
    return <EmptyState />
  }

  return (
    <div className="flex h-full w-full flex-col gap-6 p-4 text-white md:p-6">
      <div className="flex items-start gap-2 md:flex-row">
        <Button
          variant="outline"
          className="w-fit cursor-pointer rounded-lg"
          onClick={() => navigate("/models")}
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold md:text-3xl">{model.name}</h1>
            <p className="mt-1 line-clamp-2 text-sm text-white/60 md:line-clamp-none">
              {model.description}
            </p>
          </div>
        </div>

        <Button
          className="ml-auto w-fit cursor-pointer rounded-md"
          onClick={() => setIsNewEvalOpen(true)}
        >
          <CirclePlay className="size-4" />
          <span className="ml-2 hidden lg:inline">New Evaluation</span>
        </Button>
      </div>

      <ModelEvaluationPanel
        model={model}
        onSelectEvaluation={(evaluation) => {
          setActiveEvaluation(attachModel(model, evaluation))
          setIsDetailsOpen(true)
        }}
      />

      <NewEvalDialog isOpen={isNewEvalOpen} setIsOpen={setIsNewEvalOpen} />
      <CurrentEvalDialog
        isOpen={isDetailsOpen}
        setIsOpen={setIsDetailsOpen}
        evaluation={activeEvaluation}
      />
    </div>
  )
}
