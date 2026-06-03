import { useNavigate, useParams } from "react-router-dom"
import { useState } from "react"
import { ArrowLeft, CirclePlay } from "lucide-react"

import { CurrentEvalModal } from "@/components/CurrentEvalModal/CurrentEvalModal"
import { NewEvalModal } from "@/components/NewEvalModal/NewEvalModal"
import { ModelEvaluationPanel } from "@/components/models/model-evaluation-panel"

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
      <div className="flex flex-col items-center gap-4 md:flex-row">
        <Button
          variant="outline"
          className="w-fit cursor-pointer rounded-md"
          onClick={() => navigate("/models")}
        >
          <ArrowLeft className="size-4" />
        </Button>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-white/10 bg-[#1b1b1b] text-sm font-semibold text-white">
            {model.symbol}
          </div>
          <div>
            <h1 className="text-2xl font-semibold md:text-3xl">{model.name}</h1>
            <p className="mt-1 text-sm text-white/60">{model.description}</p>
          </div>
        </div>

        <Button
          className="ml-auto w-fit cursor-pointer rounded-md"
          onClick={() => setIsNewEvalOpen(true)}
        >
          <CirclePlay className="size-4" />
          New Evaluation
        </Button>
      </div>

      <ModelEvaluationPanel
        model={model}
        evaluations={model.evaluations}
        onSelectEvaluation={(evaluation) => {
          setActiveEvaluation(attachModel(model, evaluation))
          setIsDetailsOpen(true)
        }}
      />

      <NewEvalModal isOpen={isNewEvalOpen} setIsOpen={setIsNewEvalOpen} />
      <CurrentEvalModal
        isOpen={isDetailsOpen}
        setIsOpen={setIsDetailsOpen}
        evaluation={activeEvaluation}
      />
    </div>
  )
}
