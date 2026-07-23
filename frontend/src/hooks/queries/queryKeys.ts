export const modelQueryKeys = {
  all: ["models"] as const,
  summaryCards: () => [...modelQueryKeys.all, "summary-cards"] as const,
  details: () => [...modelQueryKeys.all, "detail"] as const,
  detail: (modelId: string) => [...modelQueryKeys.details(), modelId] as const,
}

export const evaluationQueryKeys = {
  all: ["evaluations"] as const,
  details: () => [...evaluationQueryKeys.all, "detail"] as const,
  detail: (evaluationId: string) =>
    [...evaluationQueryKeys.details(), evaluationId] as const,
}
