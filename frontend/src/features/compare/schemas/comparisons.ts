import type { components } from "@/types/schema"

export type ComparisonRequest = components["schemas"]["ComparisonRequest"]
export type ComparisonRead = components["schemas"]["ComparisonRead"]
export type BenchmarkMetrics = ComparisonRead[string]
export type MetricChartData = ComparisonRead[string][string]
