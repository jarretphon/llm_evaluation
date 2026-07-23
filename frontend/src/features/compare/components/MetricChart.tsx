import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type { MetricChartData } from "@/features/compare/schemas/comparisons"

const chartConfig = {
  value: {
    label: "Value",
    color: "var(--chart-1)",
  },
  model_name: {
    label: "Model",
  },
} satisfies ChartConfig

export function MetricChart({
  chartData,
}: {
  chartData: MetricChartData
}) {
  return (
    <ChartContainer
      config={chartConfig}
      className="h-72 w-full"
      initialDimension={{ width: 520, height: 288 }}
    >
      <BarChart data={chartData} margin={{ left: 8, right: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="model_name"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
        />
        <ChartTooltip
          content={<ChartTooltipContent indicator="dot" hideLabel />}
        />
        <Bar dataKey="value" fill="var(--color-value)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  )
}
