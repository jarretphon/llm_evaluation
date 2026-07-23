export const comparisonQueryKeys = {
  all: ["comparisons"] as const,
  availableModels: () =>
    [...comparisonQueryKeys.all, "available-models"] as const,
  result: (modelIds: string[]) =>
    [...comparisonQueryKeys.all, "result", modelIds] as const,
}
