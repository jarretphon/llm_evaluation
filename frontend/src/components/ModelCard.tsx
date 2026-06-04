import { Calendar } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Model } from "@/data/models"

export type ModelRunStats = {
  running: number
  completed: number
  failed: number
  queued: number
  total: number
  latestRunLabel: string | null
}

type ModelCardProps = {
  model: Model
  stats: ModelRunStats
  onSelect: (modelId: string) => void
}

const formatAddedDate = (value: string) => {
  const parsed = new Date(`${value}T00:00:00Z`)

  if (Number.isNaN(parsed.getTime())) {
    return value
  }

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function ModelCard({ model, stats, onSelect }: ModelCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(model.id)}
      className="group w-full text-left focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none"
    >
      <Card className="relative h-full gap-4 border border-border/50 bg-[#161616] text-white shadow-xl transition hover:border-white/20 hover:bg-[#1a1a1a]">
        <div className="flex justify-between gap-4 px-6">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-[#1b1b1b] text-sm font-bold text-white">
              {model.symbol}
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="truncate text-base text-white">
                {model.name}
              </CardTitle>
              <CardDescription className="line-clamp-2 text-xs leading-4 text-white/60 md:line-clamp-none">
                {model.description}
              </CardDescription>
            </div>
          </div>
          <div>
            <Badge
              variant={stats.running > 0 ? "default" : "outline"}
              className="rounded-full px-2"
            >
              {stats.running > 0 ? `${stats.running} active` : "No active"}
            </Badge>
          </div>
        </div>
        <CardContent className="space-y-3">
          <div className="flex flex-col gap-2 text-xs text-white/60">
            <div className="flex items-center gap-2">
              <Calendar className="size-3.5" />
              Added {formatAddedDate(model.addedAt)}
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <span className="text-[11px] font-semibold tracking-[0.18em] text-white/40 uppercase">
                Last run
              </span>
              <span>{stats.latestRunLabel ?? "No runs yet"}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </button>
  )
}
