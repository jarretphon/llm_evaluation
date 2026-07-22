import { screen } from "@testing-library/react"
import { vi } from "vitest"

import { ModelCard } from "@/features/models/components/ModelCard"
import { makeModel } from "../../../fixtures/models"
import { renderWithProviders } from "../../../utils/render"

describe("ModelCard", () => {
  it("renders model details", () => {
    const model = makeModel({
      name: "Routing Model",
      endpoint: "https://routing-model.example.com/v1",
      description: "Routes test prompts to a mock endpoint",
      provider: "Open AI",
      added_at: "2026-01-15",
    })

    renderWithProviders(<ModelCard model={model} onSelect={() => {}} />)

    expect(screen.getByText("Routing Model")).toBeInTheDocument()
    expect(
      screen.getByText(/https:\/\/routing-model\.example\.com\/v1/)
    ).toBeInTheDocument()
    expect(
      screen.getByText("Routes test prompts to a mock endpoint")
    ).toBeInTheDocument()
    expect(screen.getByText("OPEN")).toBeInTheDocument()
    expect(screen.getByText(/Added Jan 15, 2026/)).toBeInTheDocument()
    expect(screen.getByText("No runs yet")).toBeInTheDocument()
  })

  it("selects the model when the card is clicked", async () => {
    const onSelect = vi.fn()
    const model = makeModel()
    const { user } = renderWithProviders(
      <ModelCard model={model} onSelect={onSelect} />
    )

    await user.click(screen.getByRole("button", { name: /test model/i }))

    expect(onSelect).toHaveBeenCalledOnce()
    expect(onSelect).toHaveBeenCalledWith(model.id)
  })

  it("does not select the model when the actions menu trigger is clicked", async () => {
    const onSelect = vi.fn()
    const model = makeModel()
    const { user } = renderWithProviders(
      <ModelCard model={model} onSelect={onSelect} />
    )

    await user.click(screen.getByRole("button", { name: "Model actions" }))

    expect(onSelect).not.toHaveBeenCalled()
  })
})
