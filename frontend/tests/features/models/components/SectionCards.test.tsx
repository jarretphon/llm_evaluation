import { http, HttpResponse, delay } from "msw"
import { screen, waitFor } from "@testing-library/react"

import { AddModelModal } from "@/features/models/components/AddModelDialog"
import { DeleteConfirmationDialog } from "@/features/models/components/DeleteConfirmationDialog"
import { SectionCards } from "@/features/models/components/section-cards"
import { useEvaluationEvents } from "@/features/evaluations/hooks/useEvaluationEvents"
import { BASE_URL } from "@/services/api/client"
import {
  makeModel,
  makeModelPayload,
  makeModelSummaryCard,
} from "../../../fixtures/models"
import { installMockEventSource } from "../../../mocks/event-source"
import { server } from "../../../mocks/server"
import { fillModelForm } from "../../../utils/forms"
import { renderWithProviders } from "../../../utils/render"

// This component is used to trigger the useEvaluationEvents hook in the test environment
// allowing us to simulate evaluation update events and test how the SectionCards component
// responds to those events.
function EvaluationEventsProbe() {
  useEvaluationEvents()

  return null
}

describe("SectionCards", () => {
  it("renders a loading state while the summary is loading", () => {
    const slowResponse = delay("infinite")
    server.use(
      http.get(`${BASE_URL}/llms/summary`, async () => {
        await slowResponse
        return HttpResponse.json([])
      })
    )

    const { container } = renderWithProviders(<SectionCards />)

    expect(container.querySelector(".animate-pulse")).toBeInTheDocument()
  })

  it("renders model summary cards from the summary API", async () => {
    server.use(
      http.get(`${BASE_URL}/llms/summary`, () =>
        HttpResponse.json([
          makeModelSummaryCard({
            key: "total_models",
            header: "Total Models",
            data: "12",
            badge_data: "3 providers",
          }),
          makeModelSummaryCard({
            key: "active_evaluations",
            header: "Active Evaluations",
            data: "4",
            badge_data: "8 tasks running",
          }),
          makeModelSummaryCard({
            key: "completed_today",
            header: "Completed Today",
            data: "6",
            badge_data: "2 jobs remaining",
          }),
          makeModelSummaryCard({
            key: "needs_attention",
            header: "Needs Attention",
            data: "1",
            badge_data: "",
          }),
        ])
      )
    )

    renderWithProviders(<SectionCards />)

    expect(await screen.findByText("Total Models")).toBeInTheDocument()
    expect(screen.getByText("12")).toBeInTheDocument()
    expect(screen.getByText("3 providers")).toBeInTheDocument()
    expect(screen.getByText("Active Evaluations")).toBeInTheDocument()
    expect(screen.getByText("4")).toBeInTheDocument()
    expect(screen.getByText("8 tasks running")).toBeInTheDocument()
    expect(screen.getByText("Completed Today")).toBeInTheDocument()
    expect(screen.getByText("6")).toBeInTheDocument()
    expect(screen.getByText("2 jobs remaining")).toBeInTheDocument()
    expect(screen.getByText("Needs Attention")).toBeInTheDocument()
    expect(screen.getByText("1")).toBeInTheDocument()
  })

  it("renders an error state when the summary API fails", async () => {
    server.use(
      http.get(`${BASE_URL}/llms/summary`, () =>
        HttpResponse.json({ detail: "Summary unavailable" }, { status: 500 })
      )
    )

    renderWithProviders(<SectionCards />)

    expect(
      await screen.findByText("Failed to load model summary.")
    ).toBeInTheDocument()
  })

  it("refreshes the model count after a model is created", async () => {
    const payload = makeModelPayload()
    let summaryRequestCount = 0
    server.use(
      http.get(`${BASE_URL}/llms/summary`, () => {
        summaryRequestCount += 1
        return HttpResponse.json([
          makeModelSummaryCard({
            data: summaryRequestCount === 1 ? "1" : "2",
            badge_data: "1 provider",
          }),
        ])
      }),
      http.post(`${BASE_URL}/llms`, () =>
        HttpResponse.json(makeModel(payload), { status: 201 })
      )
    )
    const { user } = renderWithProviders(
      <>
        <SectionCards />
        <AddModelModal isOpen={true} setIsOpen={() => {}} />
      </>
    )

    expect(await screen.findByText("1")).toBeInTheDocument()

    await fillModelForm(user, payload)
    await user.click(screen.getByRole("button", { name: "Add Model" }))

    await waitFor(() => {
      expect(screen.getByText("2")).toBeInTheDocument()
    })
  })

  it("refreshes the model count after a model is deleted", async () => {
    const model = makeModel({ name: "Deleted Summary Model" })
    let summaryRequestCount = 0
    server.use(
      http.get(`${BASE_URL}/llms/summary`, () => {
        summaryRequestCount += 1
        return HttpResponse.json([
          makeModelSummaryCard({
            data: summaryRequestCount === 1 ? "7" : "6",
            badge_data: "2 providers",
          }),
        ])
      }),
      http.delete(
        `${BASE_URL}/llms/:llmId`,
        () => new HttpResponse(null, { status: 204 })
      )
    )
    const { user } = renderWithProviders(
      <>
        <SectionCards />
        <DeleteConfirmationDialog
          model={model}
          isOpen={true}
          setIsOpen={() => {}}
        />
      </>
    )

    expect(await screen.findByText("7")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Delete" }))

    await waitFor(() => {
      expect(screen.getByText("6")).toBeInTheDocument()
    })
  })

  it("refreshes evaluation stats after an evaluation update event", async () => {
    const MockEventSource = installMockEventSource()
    let summaryRequestCount = 0
    server.use(
      http.get(`${BASE_URL}/llms/summary`, () => {
        summaryRequestCount += 1
        return HttpResponse.json([
          makeModelSummaryCard({
            key: "active_evaluations",
            header: "Active Evaluations",
            data: summaryRequestCount === 1 ? "0" : "1",
            badge_data:
              summaryRequestCount === 1 ? "0 tasks running" : "3 tasks running",
          }),
        ])
      })
    )

    renderWithProviders(
      <>
        <EvaluationEventsProbe />
        <SectionCards />
      </>
    )

    expect(await screen.findByText("0")).toBeInTheDocument()

    MockEventSource.instances[0]?.emit("evaluation_update", {
      id: "00000000-0000-4000-8000-000000000001",
      status: "running",
      progress: 25,
      benchmarks: [],
      metadata_entry: {
        started_at: "2026-07-23T00:00:00Z",
        duration: 0,
      },
    })

    await waitFor(() => {
      expect(screen.getByText("1")).toBeInTheDocument()
      expect(screen.getByText("3 tasks running")).toBeInTheDocument()
    })

    vi.unstubAllGlobals()
  })
})
