import { ClipboardX } from "lucide-react"

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export function NoCompletedEvaluationsEmpty() {
  return (
    <Empty className="border border-dashed bg-muted/30">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ClipboardX />
        </EmptyMedia>
        <EmptyTitle>No completed evaluations</EmptyTitle>
        <EmptyDescription>
          This model has no completed evaluations available for comparison.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
