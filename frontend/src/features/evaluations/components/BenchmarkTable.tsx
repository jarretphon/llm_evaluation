import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { RotateCw } from "lucide-react"
import { useMemo } from "react"
import type { components } from "@/types/schema"

type EvaluationRead = components["schemas"]["EvaluationRead"]
type BenchmarkRead = components["schemas"]["BenchmarkRead"]
type BenchmarkMetricRead = components["schemas"]["BenchmarkMetricRead"]
export type BenchmarkTableBenchmark = BenchmarkRead

const formatMetricValue = (value: number | null | undefined) => {
  if (value === null || value === undefined) {
    return "—"
  }

  return Number.isInteger(value) ? value.toString() : value.toPrecision(4)
}

export function BenchmarkTable({
  evaluation,
  onRetryBenchmark,
}: {
  evaluation: EvaluationRead
  onRetryBenchmark?: (benchmark: BenchmarkTableBenchmark) => void
}) {
  const { benchmarkRows, metricNames } = useMemo(() => {
    const metricNameSet = new Set<string>()
    const rows = evaluation.benchmarks.map((benchmark) => {
      const metricsByName = new Map<string, BenchmarkMetricRead>()

      benchmark.metrics.forEach((metric) => {
        metricNameSet.add(metric.name)
        metricsByName.set(metric.name, metric)
      })

      return { benchmark, metricsByName }
    })

    return {
      benchmarkRows: rows,
      metricNames: Array.from(metricNameSet),
    }
  }, [evaluation.benchmarks])

  return (
    <div className="recent-activity-scroll h-64 w-full min-w-0 overflow-auto rounded-2xl border border-border/60">
      <Table className="w-max min-w-full">
        <TableHeader className="sticky top-0 z-10 bg-popover">
          <TableRow>
            <TableHead className="min-w-40">Benchmark</TableHead>
            <TableHead className="min-w-28">Status</TableHead>
            {metricNames.map((metricName) => (
              <TableHead
                key={metricName}
                className="min-w-28 text-right whitespace-nowrap"
              >
                {metricName}
              </TableHead>
            ))}
            {onRetryBenchmark && <TableHead className="w-10" />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {benchmarkRows.map(({ benchmark, metricsByName }) => (
            <TableRow key={benchmark.id}>
              <TableCell className="max-w-64 truncate font-medium">
                {benchmark.name}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {benchmark.status}
              </TableCell>
              {metricNames.map((metricName) => {
                const metric = metricsByName.get(metricName)

                return (
                  <TableCell
                    key={metricName}
                    className="text-right whitespace-nowrap text-muted-foreground"
                  >
                    {formatMetricValue(metric?.value)}
                    {metric?.stderr !== null && metric?.stderr !== undefined && (
                      <span className="text-xs text-muted-foreground/70">
                        {" "}
                        ± {formatMetricValue(metric.stderr)}
                      </span>
                    )}
                  </TableCell>
                )
              })}
              {onRetryBenchmark && (
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onRetryBenchmark(benchmark)}
                  >
                    <RotateCw className="size-4" />
                    <span className="sr-only">Re-run {benchmark.name}</span>
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
