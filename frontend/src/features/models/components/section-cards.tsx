"use client"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Clock, CircleAlert, ChartColumnStacked } from "lucide-react"
import { useGetModelSummaryCards } from "@/features/models/hooks/queries/useModels"
import type { ModelSummaryCard } from "@/features/models/schemas/models"
import { Skeleton } from "@/components/ui/skeleton"

const cardIcons = {
  total_models: ChartColumnStacked,
  active_evaluations: Clock,
  completed_today: CircleAlert,
  needs_attention: CircleAlert,
}

function SectionCard({ card }: { card: ModelSummaryCard }) {
  const Icon = cardIcons[card.key as keyof typeof cardIcons] ?? CircleAlert

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>{card.header}</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {card.data}
        </CardTitle>
        {card.badge_data && (
          <CardAction>
            <Badge variant="outline">
              <Icon />
              {card.badge_data}
            </Badge>
          </CardAction>
        )}
      </CardHeader>
    </Card>
  )
}

export function SectionCards() {
  const { data, isPending, error } = useGetModelSummaryCards()

  if (isPending) {
    return (
      <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="@container/card">
            <CardHeader>
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <Card>
          <CardHeader>
            <CardDescription>Model Summary</CardDescription>
            <CardTitle className="text-sm font-medium text-destructive">
              Failed to load model summary.
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      {data?.map((card) => (
        <SectionCard key={card.key} card={card} />
      ))}
    </div>
  )
}
