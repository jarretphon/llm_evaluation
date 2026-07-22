import { http, HttpResponse, delay } from "msw"
import { screen, waitFor } from "@testing-library/react"
import { useLocation } from "react-router-dom"

import { BASE_URL } from "@/services/api/client"
import { ModelGrid } from "@/features/models/components/ModelGrid"
import { makeModel } from "../../../fixtures/models"
import { server } from "../../../mocks/server"
import { renderWithProviders } from "../../../utils/render"

function LocationProbe() {
  const location = useLocation()

  return <div data-testid="location">{location.pathname}</div>
}

describe("ModelGrid", () => {
  it("shows a loading state while models are loading", () => {
    const slowResponse = delay("infinite")
    server.use(
      http.get(`${BASE_URL}/llms`, async () => {
        await slowResponse
        return HttpResponse.json([])
      })
    )

    const { container } = renderWithProviders(<ModelGrid />)

    expect(container.querySelector(".animate-spin")).toBeInTheDocument()
  })

  it("renders model cards from the models API", async () => {
    const models = [
      makeModel({ name: "First Model" }),
      makeModel({ name: "Second Model" }),
    ]
    server.use(http.get(`${BASE_URL}/llms`, () => HttpResponse.json(models)))

    renderWithProviders(<ModelGrid />)

    expect(await screen.findByText(/First Model/)).toBeInTheDocument()
    expect(screen.getByText(/Second Model/)).toBeInTheDocument()
  })

  it("shows the empty state when no models are returned", async () => {
    server.use(http.get(`${BASE_URL}/llms`, () => HttpResponse.json([])))

    renderWithProviders(<ModelGrid />)

    expect(await screen.findByText("No Models Yet")).toBeInTheDocument()
  })

  it("shows an error state when models fail to load", async () => {
    server.use(
      http.get(`${BASE_URL}/llms`, () =>
        HttpResponse.json(
          { detail: [{ msg: "Database unavailable" }] },
          { status: 500 }
        )
      )
    )

    renderWithProviders(<ModelGrid />)

    expect(await screen.findByText(/Failed to load models/)).toBeInTheDocument()
  })

  it("navigates to the selected model details page", async () => {
    const model = makeModel({ name: "Navigable Model" })
    server.use(http.get(`${BASE_URL}/llms`, () => HttpResponse.json([model])))
    const { user } = renderWithProviders(
      <>
        <ModelGrid />
        <LocationProbe />
      </>
    )

    await user.click(await screen.findByRole("button", { name: /Navigable Model/i }))

    await waitFor(() => {
      expect(screen.getByTestId("location")).toHaveTextContent(
        `/models/${model.id}`
      )
    })
  })
})
