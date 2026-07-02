import { Trophy } from "lucide-react"

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export function LeaderboardEmpty() {
  return (
    <Empty className="border border-dashed bg-muted/30 text-white">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Trophy />
        </EmptyMedia>
        <EmptyTitle>No leaderboard yet</EmptyTitle>
        <EmptyDescription>
          Select one or more benchmarks to rank models by their latest completed
          evaluation.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
