import { renderWithProviders } from "./render"
import type { LLMCreate } from "@/features/models/schemas/models"
import { screen } from "@testing-library/react"

export async function fillModelForm(
  user: ReturnType<typeof renderWithProviders>["user"],
  payload: LLMCreate
) {
  await user.clear(screen.getByLabelText("Model Name"))
  await user.type(screen.getByLabelText("Model Name"), payload.name)

  await user.clear(screen.getByLabelText("Model Endpoint"))
  await user.type(screen.getByLabelText("Model Endpoint"), payload.endpoint)

  await user.clear(screen.getByLabelText("API Key"))
  await user.type(screen.getByLabelText("API Key"), payload.api_key)

  await user.clear(screen.getByLabelText("Description"))
  await user.type(screen.getByLabelText("Description"), payload.description)
}
