import { http, HttpResponse } from "msw"

import { modelService } from "@/features/models/services/models"
import { BASE_URL } from "@/services/api/client"
import {
  makeModel,
  makeModelPayload,
  makeModelSummaryCard,
} from "../../../fixtures/models"
import { server } from "../../../mocks/server"

describe("modelService", () => {
  it("fetches model summary cards from the summary endpoint", async () => {
    const cards = [
      makeModelSummaryCard(),
      makeModelSummaryCard({
        key: "active_evaluations",
        header: "Active Evaluations",
        data: "1",
        badge_data: "2 tasks running",
      }),
    ]
    server.use(http.get(`${BASE_URL}/llms/summary`, () => HttpResponse.json(cards)))

    await expect(modelService.getModelSummaryCards()).resolves.toEqual(cards)
  })

  it("fetches all models from the models endpoint", async () => {
    const models = [makeModel({ name: "Fetched Model" })]
    server.use(http.get(`${BASE_URL}/llms`, () => HttpResponse.json(models)))

    await expect(modelService.getAllModels()).resolves.toEqual(models)
  })

  it("creates a model with the expected request body", async () => {
    const payload = makeModelPayload()
    let receivedBody: unknown
    server.use(
      http.post(`${BASE_URL}/llms`, async ({ request }) => {
        receivedBody = await request.json()
        return HttpResponse.json(makeModel(payload), { status: 201 })
      })
    )

    await modelService.createModel(payload)

    expect(receivedBody).toEqual(payload)
  })

  it("edits a model with the expected path and request body", async () => {
    const model = makeModel()
    const payload = makeModelPayload({ name: "Updated Service Model" })
    let receivedModelId: string | undefined
    let receivedBody: unknown
    server.use(
      http.patch(`${BASE_URL}/llms/:llmId`, async ({ params, request }) => {
        receivedModelId = String(params.llmId)
        receivedBody = await request.json()
        return HttpResponse.json({ ...model, ...payload })
      })
    )

    await modelService.editModel(model.id, payload)

    expect(receivedModelId).toBe(model.id)
    expect(receivedBody).toEqual(payload)
  })

  it("deletes a model with the expected path", async () => {
    const model = makeModel()
    let receivedModelId: string | undefined
    server.use(
      http.delete(`${BASE_URL}/llms/:llmId`, ({ params }) => {
        receivedModelId = String(params.llmId)
        return new HttpResponse(null, { status: 204 })
      })
    )

    await modelService.deleteModel(model.id)

    expect(receivedModelId).toBe(model.id)
  })

  it("throws when the API returns an error", async () => {
    server.use(
      http.get(`${BASE_URL}/llms`, () =>
        HttpResponse.json(
          { detail: [{ msg: "Database unavailable" }] },
          { status: 500 }
        )
      )
    )

    await expect(modelService.getAllModels()).rejects.toThrow(
      "Failed to fetch models"
    )
  })
})
