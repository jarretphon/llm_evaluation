"use client"

import { useMemo } from "react"
import { RotateCw } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Drawer, DrawerContent, DrawerFooter } from "@/components/ui/drawer"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useIsMobile } from "@/hooks/use-mobile.ts"
import type { EvaluationRecord } from "@/data/evaluations"
import { type BenchmarkRecord } from "@/data/benchmarks"

interface CurrentEvaluationDialogProps {
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  evaluation: EvaluationRecord | null
  onRetryBenchmark?: (benchmark: BenchmarkRecord) => void
}

const statusMeta = (status: EvaluationRecord["evalStatus"]) => {
  const base = {
    running: { label: "Running", variant: "default" as const },
    completed: { label: "Completed", variant: "secondary" as const },
    failed: { label: "Failed", variant: "destructive" as const },
    queued: { label: "Queued", variant: "outline" as const },
  }

  return base[status]
}

export function CurrentEvaluationDialog({
  isOpen,
  setIsOpen,
  evaluation,
  onRetryBenchmark,
}: CurrentEvaluationDialogProps) {
  const isMobile = useIsMobile()

  const content = useMemo(() => {
    if (!evaluation) {
      return null
    }

    const isRunning = evaluation.evalStatus === "running"
    const meta = statusMeta(evaluation.evalStatus)
    const timelineRows = isRunning
      ? [
          ["Started", evaluation.metadata.start],
          ["Duration", evaluation.metadata.duration],
          ["Estimated End", evaluation.metadata.estimatedEnd ?? "—"],
        ]
      : [
          ["Started", evaluation.metadata.start],
          ["Ended", evaluation.metadata.end ?? "—"],
          ["Duration", evaluation.metadata.duration],
        ]

    return (
      <div className="flex max-h-[80vh] flex-col overflow-hidden">
        <div className="flex items-start justify-between gap-4 border-b border-border/60 px-6 py-5">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="font-heading text-xl font-semibold tracking-tight">
                {evaluation.model.name}
              </h2>
              <Badge
                variant={meta.variant}
                className="ml-auto w-fit rounded-full px-2.5"
              >
                {meta.label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {isRunning
                ? "Evaluation in progress"
                : "Evaluation run completed"}
            </p>
          </div>
        </div>

        <div className="overflow-y-auto px-6 py-5">
          <div className="space-y-4">
            <div className="flex flex-nowrap gap-3 overflow-x-auto">
              {timelineRows.map(([label, value]) => (
                <div
                  key={label}
                  className="min-w-32 flex-1 rounded-2xl border border-border/50 bg-muted/20 p-3"
                >
                  <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                    {label}
                  </p>
                  <p className="mt-2 text-sm font-medium text-foreground">
                    {value}
                  </p>
                </div>
              ))}
            </div>
            {isRunning ? (
              <div className="rounded-3xl border border-border/50 bg-muted/20 p-4">
                <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                  Progress
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <Progress
                    value={evaluation.metadata.progress ?? 0}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium text-muted-foreground tabular-nums">
                    {evaluation.metadata.progress ?? 0}%
                  </span>
                </div>
              </div>
            ) : null}

            <div className="mt-3 overflow-hidden rounded-2xl border border-border/60">
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
          </div>
        </div>
      </div>
    )
  }, [evaluation, onRetryBenchmark])

  if (!evaluation) {
    return null
  }

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerContent>
          {content}
          <DrawerFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-3xl">{content}</DialogContent>
    </Dialog>
  )
}
