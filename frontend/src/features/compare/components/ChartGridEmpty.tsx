import { ChartPie } from "lucide-react"

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export function ChartGridEmpty() {
  return (
    <Empty className="border border-dashed bg-muted/30">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ChartPie />
        </EmptyMedia>
        <EmptyTitle>Nothing to compare</EmptyTitle>
        <EmptyDescription>
          You haven't selected any models yet. Please select at least one model
          to compare.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
