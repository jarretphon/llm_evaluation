import { Progress } from "@/components/ui/progress"
import type { EvaluationRead } from "@/features/evaluations/schemas/evaluations"
import { formatProgressValue } from "@/features/evaluations/utils/utils"

export function EvalProgress({ evaluation }: { evaluation: EvaluationRead }) {
  const progress = evaluation.progress ?? 0

  return (
    <div className="rounded-3xl border border-border/50 bg-muted/20 p-4">
      <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
        Progress
      </p>
      <div className="mt-3 flex items-center gap-3">
        <Progress value={formatProgressValue(progress)} className="flex-1" />
        <span className="text-sm font-medium text-muted-foreground tabular-nums">
          {formatProgressValue(progress)}%
        </span>
      </div>
    </div>
  )
}
