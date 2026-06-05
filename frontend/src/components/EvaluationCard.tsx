import { type EvaluationRecord } from "@/data/evaluations"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

const EvaluationProgress = ({ record }: { record: EvaluationRecord }) => {
  const progress = record.metadata.progress ?? 0
  const type = record.evalStatus

  return type === "running" ? (
    <div className="flex w-full flex-col gap-2 min-w-50 sm:flex-1 lg:max-w-90">
      <div className="w-full">
        <div className="flex items-center justify-between text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
          <span>Status</span>
          <span>{type}</span>
        </div>

        <div className="mt-2 flex items-center gap-3">
          <Progress value={progress} className="flex-1" />
          <span className="text-sm font-medium text-foreground/80 tabular-nums">
            {progress}%
          </span>
        </div>
      </div>
    </div>
  ) : (
    <div className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground capitalize">
      <Badge variant="outline">{type}</Badge>
    </div>
  )
}

export function EvaluationCard({
  record,
  onSelect,
}: {
  record: EvaluationRecord
  onSelect: (record: EvaluationRecord) => void | undefined
}) {
  return (
    <div
      className="flex cursor-pointer flex-col gap-4 rounded-xl bg-[#202020] p-4 transition hover:bg-[#252525] sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
      onClick={() => onSelect(record)}
    >
      <div className="flex min-w-0 items-start gap-3 sm:flex-1 sm:basis-64">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-white">
            {record.id}
          </h3>
          <p className="mt-1 text-xs font-medium tracking-wide text-zinc-400">
            Started {record.metadata.start}
          </p>
        </div>
      </div>

      <EvaluationProgress record={record} />
    </div>
  )
}
