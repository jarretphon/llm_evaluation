export type ComparisonRequest = {
  model_ids: string[]
}

export type ComparisonModel = {
  id: string
  name: string
  provider: string
  latest_evaluation_id: string | null
}

export type ComparisonValue = {
  model_id: string
  metric: string
  value: number | null
}

export type ComparisonBenchmark = {
  name: string
  metrics: string[]
  values: ComparisonValue[]
}

export type ComparisonRead = {
  models: ComparisonModel[]
  benchmarks: ComparisonBenchmark[]
}
