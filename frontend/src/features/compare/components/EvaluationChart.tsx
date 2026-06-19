import { useMemo } from "react"
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
} from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type { BenchmarkCategory } from "@/data/benchmark-categories"
import type { Model } from "@/data/models"
import { getBenchmarkScore } from "@/data/model-benchmark-scores"

const chartColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
]

type ModelRadarChartProps = {
  category: BenchmarkCategory
  models: Model[]
}

export function EvaluationChart({ category, models }: ModelRadarChartProps) {
  const chartConfig = useMemo(() => {
    return models.reduce<ChartConfig>((acc, model, index) => {
      acc[model.id] = {
        label: model.name,
        color: chartColors[index % chartColors.length],
      }
      return acc
    }, {})
  }, [models])

  const chartData = useMemo(() => {
    return category.benchmarks.map((benchmark) => {
      const row: Record<string, number | string> = {
        benchmark: benchmark.name,
      }

      models.forEach((model) => {
        row[model.id] = getBenchmarkScore(model.id, benchmark.id)
      })

      return row
    })
  }, [category.benchmarks, models])

  return (
    <Card className="border border-border/60 bg-[#151515] text-white">
      <CardHeader>
        <CardTitle className="text-base text-white">{category.label}</CardTitle>
        <CardDescription className="text-xs text-white/60">
          {category.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {models.length ? (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-90 w-full"
          >
            <RadarChart data={chartData}>
              <PolarGrid gridType="circle" className="fill-muted/50" />
              <PolarAngleAxis
                dataKey="benchmark"
                tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 11 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 11 }}
              />
              <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
              <ChartLegend content={<ChartLegendContent />} />
              {models.map((model) => (
                <Radar
                  key={model.id}
                  dataKey={model.id}
                  fill={`var(--color-${model.id})`}
                  fillOpacity={0.2}
                  stroke={`var(--color-${model.id})`}
                  strokeWidth={1.5}
                />
              ))}
            </RadarChart>
          </ChartContainer>
        ) : (
          <div className="flex h-65 items-center justify-center text-sm text-white/50">
            Select models to render the radar chart.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
