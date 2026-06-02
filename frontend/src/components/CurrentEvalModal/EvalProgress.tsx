import { type EvaluationRecord } from "@/data/evaluations"
import { Progress } from "@/components/ui/progress"

export function EvalProgress({ evaluation }: { evaluation: EvaluationRecord }) {
  return (
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
  )
}
