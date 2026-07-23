import { http, HttpResponse } from "msw"
import { screen, waitFor } from "@testing-library/react"
import { ModelEvaluationPanel } from "@/features/evaluations/components/EvaluationPanel"
import { useCreateEvaluation } from "@/features/evaluations/hooks/queries/useEvaluations"
import { useGetModelById } from "@/features/models/hooks/queries/useModels"
import { BASE_URL } from "@/services/api/client"
import type { EvaluationRead } from "@/features/evaluations/schemas/evaluations"
import type { LLMRead } from "@/features/models/schemas/models"
import { makeModel } from "../../../fixtures/models"
import { server } from "../../../mocks/server"
import { renderWithProviders } from "../../../utils/render"

vi.mock("@/features/evaluations/components/TimeRangeFilter", () => ({
  TimeRangeFilter: () => <div data-testid="time-range-filter" />,
}))

function ModelDetailsEvaluationProbe({ modelId }: { modelId: string }) {
  const { data: model } = useGetModelById({ modelId })
  const { mutate: createEvaluation } = useCreateEvaluation()

  if (!model) {
    return null
  }

  return (
    <>
      <button
        type="button"
        onClick={() =>
          createEvaluation({
            model_id: model.id,
            model_endpoint: model.endpoint,
            model_name: model.name,
            benchmarks: ["mmlu"],
          })
        }
      >
        Start Evaluation
      </button>
      <ModelEvaluationPanel model={model} onSelectEvaluation={() => {}} />
    </>
  )
}

describe("ModelDetails", () => {
  it("updates the evaluation panel with a new evaluation card after creating an evaluation", async () => {
    const createdEvaluation: EvaluationRead = {
      id: "00000000-0000-4000-8000-000000000301",
      status: "queued",
      progress: 0,
      benchmarks: [
        {
          id: "00000000-0000-4000-8000-000000000401",
          name: "mmlu",
          description: "Massive Multitask Language Understanding",
          status: "queued",
          effective_sample_count: 0,
          metrics: [],
        },
      ],
      metadata_entry: {
        started_at: "2026-07-23T00:00:00Z",
        duration: 0,
      },
    }
    const initialModel = makeModel({
      id: "00000000-0000-4000-8000-000000000501",
      evaluations: [],
    })
    const modelWithEvaluation: LLMRead = {
      ...initialModel,
      evaluations: [createdEvaluation],
    }
    let modelRequestCount = 0

    server.use(
      http.get(`${BASE_URL}/llms/:llmId`, () => {
        modelRequestCount += 1
        return HttpResponse.json(
          modelRequestCount === 1 ? initialModel : modelWithEvaluation
        )
      }),
      http.post(`${BASE_URL}/evaluations`, () =>
        HttpResponse.json(createdEvaluation)
      )
    )

    const { user } = renderWithProviders(
      <ModelDetailsEvaluationProbe modelId={initialModel.id} />
    )

    expect(
      await screen.findByText("No evaluation instances match this date range.")
    ).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Start Evaluation" }))

    await waitFor(() => {
      expect(screen.getByText(createdEvaluation.id)).toBeInTheDocument()
      expect(screen.getByText("0%")).toBeInTheDocument()
      expect(screen.getByText(/1 benchmarks/)).toBeInTheDocument()
    })
  })
})
