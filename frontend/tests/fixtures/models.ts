import type { LLMCreate, LLMRead } from "@/features/models/schemas/models"

let modelSequence = 0

export function makeModel(overrides: Partial<LLMRead> = {}): LLMRead {
  modelSequence += 1

  return {
    id: `00000000-0000-4000-8000-${modelSequence.toString().padStart(12, "0")}`,
    name: `Test Model ${modelSequence}`,
    endpoint: `https://model-${modelSequence}.example.com/v1`,
    description: `Test model ${modelSequence} description`,
    provider: "Open AI",
    api_key: `test-api-key-${modelSequence}`,
    added_at: "2026-01-15T00:00:00Z",
    evaluations: [],
    ...overrides,
  }
}

export function makeModelPayload(
  overrides: Partial<LLMCreate> = {}
): LLMCreate {
  return {
    name: "New Test Model",
    endpoint: "https://new-model.example.com/v1",
    description: "A newly submitted model",
    provider: "Open AI",
    api_key: "new-test-api-key",
    ...overrides,
  }
}
