import { http, HttpResponse } from "msw"
import { screen, waitFor } from "@testing-library/react"
import { vi } from "vitest"
import { toast } from "sonner"

import { AddModelModal } from "@/features/models/components/AddModelDialog"
import { DeleteConfirmationDialog } from "@/features/models/components/DeleteConfirmationDialog"
import { EditModelModal } from "@/features/models/components/EditModelDialog"
import { ModelFilter } from "@/features/models/components/ModelFilter"
import { BASE_URL } from "@/services/api/client"
import { makeModel, makeModelPayload } from "../../../fixtures/models"
import { server } from "../../../mocks/server"
import { renderWithProviders } from "../../../utils/render"
import { fillModelForm } from "../../../utils/forms"

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

describe("model dialogs and forms", () => {
  it("opens the add model dialog from the model filter", async () => {
    const { user } = renderWithProviders(
      <ModelFilter
        providers={["All", "Open AI"]}
        selectedProvider="All"
        onProviderChange={() => {}}
      />
    )

    await user.click(screen.getByRole("button", { name: /New Model/i }))

    expect(
      screen.getByRole("heading", { name: "Add New Model" })
    ).toBeInTheDocument()
  })

  it("shows validation errors and does not create a model for empty required fields", async () => {
    let createRequestCount = 0
    server.use(
      http.post(`${BASE_URL}/llms`, () => {
        createRequestCount += 1
        return HttpResponse.json(makeModel(), { status: 201 })
      })
    )
    const { user } = renderWithProviders(
      <AddModelModal isOpen={true} setIsOpen={() => {}} />
    )

    await user.click(screen.getByRole("button", { name: "Add Model" }))

    expect(
      await screen.findByText("Please enter a name for the model.")
    ).toBeInTheDocument()
    expect(
      screen.getByText("Please enter a valid URL (e.g., https://...)")
    ).toBeInTheDocument()
    expect(screen.getByText("Please enter an API key.")).toBeInTheDocument()
    expect(createRequestCount).toBe(0)
  })

  it("shows endpoint validation and does not create a model for an invalid URL", async () => {
    let createRequestCount = 0
    server.use(
      http.post(`${BASE_URL}/llms`, () => {
        createRequestCount += 1
        return HttpResponse.json(makeModel(), { status: 201 })
      })
    )
    const payload = makeModelPayload({ endpoint: "not-a-url" })
    const { user } = renderWithProviders(
      <AddModelModal isOpen={true} setIsOpen={() => {}} />
    )

    await fillModelForm(user, payload)
    await user.click(screen.getByRole("button", { name: "Add Model" }))

    expect(
      await screen.findByText("Please enter a valid URL (e.g., https://...)")
    ).toBeInTheDocument()
    expect(createRequestCount).toBe(0)
  })

  it("creates a model with the submitted form values", async () => {
    const setIsOpen = vi.fn()
    const payload = makeModelPayload()
    let receivedBody: unknown
    server.use(
      http.post(`${BASE_URL}/llms`, async ({ request }) => {
        receivedBody = await request.json()
        return HttpResponse.json(makeModel(payload), { status: 201 })
      })
    )
    const { user } = renderWithProviders(
      <AddModelModal isOpen={true} setIsOpen={setIsOpen} />
    )

    await fillModelForm(user, payload)
    await user.click(screen.getByRole("button", { name: "Add Model" }))

    await waitFor(() => {
      expect(receivedBody).toEqual(payload)
      expect(setIsOpen).toHaveBeenCalledWith(false)
      expect(toast.success).toHaveBeenCalledWith("Model added successfully!")
    })
  })

  it("keeps the add dialog open and shows an error toast when creation fails", async () => {
    const setIsOpen = vi.fn()
    server.use(
      http.post(`${BASE_URL}/llms`, () =>
        HttpResponse.json(
          { detail: [{ msg: "Model name already exists" }] },
          { status: 409 }
        )
      )
    )
    const { user } = renderWithProviders(
      <AddModelModal isOpen={true} setIsOpen={setIsOpen} />
    )

    await fillModelForm(user, makeModelPayload())
    await user.click(screen.getByRole("button", { name: "Add Model" }))

    await waitFor(() => {
      expect(setIsOpen).not.toHaveBeenCalledWith(false)
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining("Failed to add model")
      )
    })
    expect(
      screen.getByRole("heading", { name: "Add New Model" })
    ).toBeInTheDocument()
  })

  it("prefills and submits edited model values", async () => {
    const model = makeModel({
      name: "Old Model",
      endpoint: "https://old-model.example.com/v1",
      api_key: "old-key",
      description: "Old description",
    })
    const updatedPayload = makeModelPayload({
      name: "Updated Model",
      endpoint: "https://updated-model.example.com/v1",
      api_key: "updated-key",
      description: "Updated description",
    })
    const setIsOpen = vi.fn()
    let receivedBody: unknown
    server.use(
      http.patch(`${BASE_URL}/llms/:llmId`, async ({ params, request }) => {
        expect(params.llmId).toBe(model.id)
        receivedBody = await request.json()
        return HttpResponse.json({ ...model, ...updatedPayload })
      })
    )
    const { user } = renderWithProviders(
      <EditModelModal isOpen={true} setIsOpen={setIsOpen} model={model} />
    )

    expect(screen.getByDisplayValue("Old Model")).toBeInTheDocument()
    expect(
      screen.getByDisplayValue("https://old-model.example.com/v1")
    ).toBeInTheDocument()

    await fillModelForm(user, updatedPayload)
    await user.click(screen.getByRole("button", { name: "Save Changes" }))

    await waitFor(() => {
      expect(receivedBody).toEqual(updatedPayload)
      expect(setIsOpen).toHaveBeenCalledWith(false)
      expect(toast.success).toHaveBeenCalledWith("Model updated successfully!")
    })
  })

  it("shows an error toast when editing fails", async () => {
    const model = makeModel()
    const setIsOpen = vi.fn()
    server.use(
      http.patch(`${BASE_URL}/llms/:llmId`, () =>
        HttpResponse.json(
          { detail: [{ msg: "Model name already exists" }] },
          { status: 409 }
        )
      )
    )
    const { user } = renderWithProviders(
      <EditModelModal isOpen={true} setIsOpen={setIsOpen} model={model} />
    )

    await fillModelForm(user, makeModelPayload({ name: "Duplicate Model" }))
    await user.click(screen.getByRole("button", { name: "Save Changes" }))

    await waitFor(() => {
      expect(setIsOpen).not.toHaveBeenCalledWith(false)
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining("Failed to update model")
      )
    })
  })

  it("cancels model deletion without calling the API", async () => {
    const model = makeModel()
    const setIsOpen = vi.fn()
    let deleteRequestCount = 0
    server.use(
      http.delete(`${BASE_URL}/llms/:llmId`, () => {
        deleteRequestCount += 1
        return new HttpResponse(null, { status: 204 })
      })
    )
    const { user } = renderWithProviders(
      <DeleteConfirmationDialog
        model={model}
        isOpen={true}
        setIsOpen={setIsOpen}
      />
    )

    await user.click(screen.getByRole("button", { name: "Cancel" }))

    expect(deleteRequestCount).toBe(0)
    expect(setIsOpen).toHaveBeenCalled()
    expect(setIsOpen.mock.calls[0]?.[0]).toBe(false)
  })

  it("deletes a model after confirmation", async () => {
    const model = makeModel()
    const setIsOpen = vi.fn()
    let deletedModelId: string | undefined
    server.use(
      http.delete(`${BASE_URL}/llms/:llmId`, ({ params }) => {
        deletedModelId = String(params.llmId)
        return new HttpResponse(null, { status: 204 })
      })
    )
    const { user } = renderWithProviders(
      <DeleteConfirmationDialog
        model={model}
        isOpen={true}
        setIsOpen={setIsOpen}
      />
    )

    await user.click(screen.getByRole("button", { name: "Delete" }))

    await waitFor(() => {
      expect(deletedModelId).toBe(model.id)
      expect(setIsOpen).toHaveBeenCalledWith(false)
      expect(toast.success).toHaveBeenCalledWith("Model deleted successfully!")
    })
  })

  it("shows an error toast and closes the delete dialog when deletion fails", async () => {
    const model = makeModel()
    const setIsOpen = vi.fn()
    server.use(
      http.delete(`${BASE_URL}/llms/:llmId`, () =>
        HttpResponse.json(
          { detail: [{ msg: "Model not found" }] },
          { status: 404 }
        )
      )
    )
    const { user } = renderWithProviders(
      <DeleteConfirmationDialog
        model={model}
        isOpen={true}
        setIsOpen={setIsOpen}
      />
    )

    await user.click(screen.getByRole("button", { name: "Delete" }))

    await waitFor(() => {
      expect(setIsOpen).toHaveBeenCalledWith(false)
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining("Failed to delete model")
      )
    })
  })
})
