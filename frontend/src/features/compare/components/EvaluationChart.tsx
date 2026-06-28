import { useMemo } from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type {
  ComparisonBenchmark,
  ComparisonModel,
} from "@/features/compare/schemas/comparisons"

const chartConfig = {
  value: {
    label: "Value",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

type EvaluationChartProps = {
  benchmark: ComparisonBenchmark
  models: ComparisonModel[]
}

export function EvaluationChart({ benchmark, models }: EvaluationChartProps) {
  const defaultMetric = benchmark.metrics[0]

  if (!defaultMetric) {
    return (
      <Card className="border border-border/60 bg-[#151515] text-white">
        <CardHeader>
          <CardTitle className="text-base text-white">
            {benchmark.name}
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
        <CardTitle className="text-base text-white">{benchmark.name}</CardTitle>
        <CardDescription className="text-xs text-white/60">
          Latest completed evaluation only
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={defaultMetric} className="gap-4">
          <TabsList className="max-w-full justify-start overflow-x-auto rounded-2xl bg-muted/60 p-1">
            {benchmark.metrics.map((metric) => (
              <TabsTrigger key={metric} value={metric} className="px-3">
                {metric}
              </TabsTrigger>
            ))}
          </TabsList>

          {benchmark.metrics.map((metric) => (
            <MetricChart
              key={metric}
              benchmark={benchmark}
              metric={metric}
              models={models}
            />
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}

function MetricChart({
  benchmark,
  metric,
  models,
}: {
  benchmark: ComparisonBenchmark
  metric: string
  models: ComparisonModel[]
}) {
  const { chartData, missingModelNames } = useMemo(() => {
    const valuesByModelId = new Map(
      benchmark.values
        .filter((value) => value.metric === metric)
        .map((value) => [value.model_id, value.value])
    )

    const rows = models.map((model) => {
      const value = valuesByModelId.get(model.id) ?? null

      return {
        model: model.name,
        value,
      }
    })
    const missingNames = rows
      .filter((row) => row.value === null)
      .map((row) => row.model)

    return {
      chartData: rows,
      missingModelNames: missingNames,
    }
  }, [benchmark.values, metric, models])

  return (
    <TabsContent value={metric} className="space-y-3">
      <ChartContainer
        config={chartConfig}
        className="h-72 w-full"
        initialDimension={{ width: 520, height: 288 }}
      >
        <BarChart data={chartData} margin={{ left: 8, right: 8 }}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="model"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tick={{ fill: "rgba(255,255,255,0.65)", fontSize: 11 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 11 }}
          />
          <ChartTooltip
            content={<ChartTooltipContent indicator="dot" hideLabel />}
          />
          <Bar
            dataKey="value"
            fill="var(--color-value)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ChartContainer>

      {missingModelNames.length > 0 && (
        <p className="text-xs text-white/50">
          No value: {missingModelNames.join(", ")}
        </p>
      )}
    </TabsContent>
  )
}
