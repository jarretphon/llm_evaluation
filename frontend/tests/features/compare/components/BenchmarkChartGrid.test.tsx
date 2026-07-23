import { http, HttpResponse } from "msw"
import { screen } from "@testing-library/react"

import { BenchmarkChartGrid } from "@/features/compare/components/BenchmarkChartGrid"
import { BASE_URL } from "@/services/api/client"
import { server } from "../../../mocks/server"
import { renderWithProviders } from "../../../utils/render"

describe("BenchmarkChartGrid", () => {
  it("shows the no-selection empty state when no models are selected", () => {
    renderWithProviders(<BenchmarkChartGrid selectedModelIds={[]} />)

    expect(screen.getByText("Nothing to compare")).toBeInTheDocument()
    expect(
      screen.getByText(/Please select at least one model to compare./)
    ).toBeInTheDocument()
  })

  it("shows the no-completed-evaluations state when selected models have no comparison data", async () => {
    server.use(
      http.post(`${BASE_URL}/comparisons`, () => HttpResponse.json({}))
    )

    renderWithProviders(
      <BenchmarkChartGrid
        selectedModelIds={["00000000-0000-4000-8000-000000000001"]}
      />
    )

    expect(await screen.findByText("No completed evaluations")).toBeInTheDocument()
    expect(
      screen.getByText(
        "This model has no completed evaluations available for comparison."
      )
    ).toBeInTheDocument()
  })
})
