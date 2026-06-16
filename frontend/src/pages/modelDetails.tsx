import { useNavigate, useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { ArrowLeft, CirclePlay } from "lucide-react"

import { CurrentEvalDialog } from "@/components/CurrentEvalDialog/CurrentEvalDialog"
import { NewEvalDialog } from "@/components/NewEvalDialog/NewEvalDialog"
import { ModelEvaluationPanel } from "@/components/EvaluationPanel"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
// import type { EvaluationRecord } from "@/data/evaluations"
// import type { Model } from "@/data/models"
import { modelService } from "@/services/models/user.service"
import type { components } from "@/types/schema"

type Model = components["schemas"]["LLMRead"]
type EvaluationRecord = components["schemas"]["EvaluationRead"]

const EmptyState = ({ message }: { message?: string }) => {
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
          {message ?? "This model could not be found."}
        </CardContent>
      </Card>
    </div>
  )
}

export function ModelDetails() {
  const { modelId } = useParams()
  const navigate = useNavigate()

  const [model, setModel] = useState<Model | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const [isNewEvalOpen, setIsNewEvalOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [activeEvaluation, setActiveEvaluation] =
    useState<EvaluationRecord | null>(null)

  useEffect(() => {
    if (!modelId) {
      navigate("/models", { replace: true })
      return
    }

    modelService
      .getModelById(modelId)
      .then((data: Model) => setModel(data))
      .catch((err: Error) => setError(err))
      .finally(() => setLoading(false))
  }, [modelId, navigate])

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-white/80" />
      </div>
    )
  }

  if (!model) {
    return <EmptyState message={error?.message} />
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
            <h1 className="text-2xl font-semibold md:text-3xl">
              {model.endpoint}
            </h1>
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
          setActiveEvaluation(evaluation)
          setIsDetailsOpen(true)
        }}
      />

      <NewEvalDialog isOpen={isNewEvalOpen} setIsOpen={setIsNewEvalOpen} />
      <CurrentEvalDialog
        isOpen={isDetailsOpen}
        setIsOpen={setIsDetailsOpen}
        evaluation={activeEvaluation}
        model={model}
      />
    </div>
  )
}
