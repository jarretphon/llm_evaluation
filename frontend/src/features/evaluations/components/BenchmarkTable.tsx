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
type BenchmarkResultValue = string | number | boolean | null
type MetricResults = Record<string, BenchmarkResultValue>
export type BenchmarkTableBenchmark = Omit<BenchmarkRead, "results"> & {
  results: Record<string, BenchmarkResultValue>
}
export type BenchmarkTableEvaluation = Omit<EvaluationRead, "benchmarks"> & {
  benchmarks: BenchmarkTableBenchmark[]
}

const isStderrMetric = (metricName: string) => metricName.includes("stderr")

// const getStderrMetricValue = (
//   metricResults: MetricResults,
//   metricName: string
// ) => {
//   const metricParts = metricName.split(",")
//   const possibleStderrMetricNames = [
//     `${metricName},stderr`,
//     `${metricName}_stderr`,
//     metricParts.length > 1
//       ? `${metricParts[0]}_stderr,${metricParts.slice(1).join(",")}`
//       : undefined,
//   ].filter(Boolean) as string[]

//   return possibleStderrMetricNames
//     .map((stderrMetricName) => metricResults[stderrMetricName])
//     .find((metricValue) => metricValue !== undefined)
// }

const getStderrValue = (metricName: string, metricResults: MetricResults) => {
  const key = metricName + ",stderr"
  return metricResults[key]
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
      const metricResults = benchmark.results

      Object.entries(metricResults).forEach(([metricName, _]) => {
        if (!isStderrMetric(metricName)) {
          metricNameSet.add(metricName)
        }
      })

      return { benchmark, metricResults }
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
          {benchmarkRows.map(({ benchmark, metricResults }) => (
            <TableRow key={benchmark.id}>
              <TableCell className="max-w-64 truncate font-medium">
                {benchmark.name}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {benchmark.status}
              </TableCell>
              {metricNames.map((metricName) => {
                const stderrMetricValue = getStderrValue(
                  metricName,
                  metricResults
                )

                return (
                  <TableCell
                    key={metricName}
                    className="text-right whitespace-nowrap text-muted-foreground"
                  >
                    {metricResults[metricName]}
                    {stderrMetricValue !== undefined && (
                      <span className="text-xs text-muted-foreground/70">
                        {" "}
                        ± {stderrMetricValue}
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
