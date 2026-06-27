import { useNavigate, useParams } from "react-router-dom"
import { useState } from "react"
import { ArrowLeft, CirclePlay } from "lucide-react"

import { CurrentEvalDialog } from "@/features/evaluations/components/CurrentEvalDialog"
import { NewEvalDialog } from "@/features/evaluations/components/NewEvalDialog"
import { ModelEvaluationPanel } from "@/features/evaluations/components/EvaluationPanel"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import type { components } from "@/types/schema"
import { useGetModelById } from "@/features/models/hooks/queries/useModels"

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

  const [isNewEvalOpen, setIsNewEvalOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [activeEvaluation, setActiveEvaluation] =
    useState<EvaluationRecord | null>(null)

  const { data, isPending, error } = useGetModelById({ modelId: modelId ?? "" })

  if (isPending) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-white/80" />
      </div>
    )
  }

  if (error) {
    toast.error(`Failed to load model: ${error.message}`)
  }

  if (!data) {
    return <EmptyState message="This model could not be found." />
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
              {data.name} - {data.endpoint}
            </h1>
            <p className="mt-1 line-clamp-2 text-sm text-white/60 md:line-clamp-none">
              {data.description}
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
        model={data}
        onSelectEvaluation={(evaluation) => {
          setActiveEvaluation(evaluation)
          setIsDetailsOpen(true)
        }}
      />

      <NewEvalDialog
        isOpen={isNewEvalOpen}
        setIsOpen={setIsNewEvalOpen}
        model={data}
      />
      <CurrentEvalDialog
        isOpen={isDetailsOpen}
        setIsOpen={setIsDetailsOpen}
        evaluation={activeEvaluation}
        model={data}
      />
    </div>
  )
}
