import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { BenchmarkMetrics } from "@/features/compare/schemas/comparisons"
import { MetricChart } from "@/features/compare/components/MetricChart"

type MetricChartGridProps = {
  benchmarkName: string
  metrics: BenchmarkMetrics
}

export function BenchmarkChart({
  benchmarkName,
  metrics,
}: MetricChartGridProps) {
  const metricNames = Object.keys(metrics)
  const defaultMetric = metricNames[0]

  if (!defaultMetric) {
    return (
      <Card className="border border-border/60 bg-[#151515] text-white">
        <CardHeader>
          <CardTitle className="text-base text-white">
            {benchmarkName}
          </CardTitle>
          <CardDescription className="text-xs text-white/60">
            No numeric metrics were found for this benchmark.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="border border-border/60 bg-[#151515] text-white">
      <CardHeader>
        <CardTitle className="text-base text-white">{benchmarkName}</CardTitle>
        <CardDescription className="text-xs text-white/60">
          Latest completed evaluation only
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={defaultMetric} className="gap-4">
          <TabsList className="max-w-full justify-start overflow-x-auto rounded-2xl bg-muted/60 p-1">
            {metricNames.map((metric) => (
              <TabsTrigger key={metric} value={metric} className="px-3">
                {metric}
              </TabsTrigger>
            ))}
          </TabsList>

          {metricNames.map((metric) => (
            <TabsContent value={metric}>
              <MetricChart key={metric} chartData={metrics[metric] ?? []} />
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}
