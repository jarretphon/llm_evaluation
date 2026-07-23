import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"

import { evaluationQueryKeys, modelQueryKeys } from "@/hooks/queries/queryKeys"
import { BASE_URL } from "@/services/api/client"
import type { components } from "@/types/schema"

type EvaluationRead = components["schemas"]["EvaluationRead"]
type LLMRead = components["schemas"]["LLMRead"]

const upsertEvaluation = (
  evaluations: EvaluationRead[] | undefined,
  updatedEvaluation: EvaluationRead
) => {
  if (!evaluations) {
    return [updatedEvaluation]
  }

  const hasEvaluation = evaluations.some(
    (evaluation) => evaluation.id === updatedEvaluation.id
  )

  if (!hasEvaluation) {
    return [updatedEvaluation, ...evaluations]
  }

  return evaluations.map((evaluation) =>
    evaluation.id === updatedEvaluation.id ? updatedEvaluation : evaluation
  )
}

const replaceModelEvaluation = (
  model: LLMRead | undefined,
  updatedEvaluation: EvaluationRead
) => {
  if (!model) {
    return model
  }

  const hasEvaluation = model.evaluations.some(
    (evaluation) => evaluation.id === updatedEvaluation.id
  )

  if (!hasEvaluation) {
    return model
  }

  return {
    ...model,
    evaluations: model.evaluations.map((evaluation) =>
      evaluation.id === updatedEvaluation.id ? updatedEvaluation : evaluation
    ),
  }
}

export function useEvaluationEvents() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const eventSource = new EventSource(`${BASE_URL}/evaluations/events`)

    const handleEvaluationUpdate = (event: Event) => {
      const messageEvent = event as MessageEvent<string>

      try {
        const updatedEvaluation = JSON.parse(
          messageEvent.data
        ) as EvaluationRead

        queryClient.setQueryData<EvaluationRead[]>(
          evaluationQueryKeys.all,
          (evaluations) => upsertEvaluation(evaluations, updatedEvaluation)
        )
        queryClient.setQueryData<EvaluationRead>(
          evaluationQueryKeys.detail(updatedEvaluation.id),
          updatedEvaluation
        )
        queryClient.setQueriesData<LLMRead>(
          { queryKey: modelQueryKeys.details() },
          (model) => replaceModelEvaluation(model, updatedEvaluation)
        )
        queryClient.invalidateQueries({
          queryKey: modelQueryKeys.summaryCards(),
        })
      } catch (error) {
        console.error("Failed to parse evaluation update event", error)
      }
    }

    eventSource.addEventListener("evaluation_update", handleEvaluationUpdate)

    return () => {
      eventSource.removeEventListener(
        "evaluation_update",
        handleEvaluationUpdate
      )
      eventSource.close()
    }
  }, [queryClient])
}
