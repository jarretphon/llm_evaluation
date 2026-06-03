import type { BenchmarkRecord } from "@/data/benchmarks"
import type { EvaluationRecord } from "@/data/evaluations"
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

export function BenchmarkTable({
  evaluation,
  onRetryBenchmark,
}: {
  evaluation: EvaluationRecord
  onRetryBenchmark?: (benchmark: BenchmarkRecord) => void
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/60">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Benchmark</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {evaluation.benchmarkRecords.map((benchmarkRecord) => (
            <TableRow key={benchmarkRecord.benchmark.name}>
              <TableCell className="font-medium">
                {benchmarkRecord.benchmark.name}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {benchmarkRecord.status}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onRetryBenchmark?.(benchmarkRecord)}
                >
                  <RotateCw className="size-4" />
                  <span className="sr-only">
                    Re-run {benchmarkRecord.benchmark.name}
                  </span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
