import { Activity, Calendar, ChevronRight } from "lucide-react"

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
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
      <Card className="relative h-full border border-border/50 bg-[#161616] text-white shadow-xl transition hover:border-white/20 hover:bg-[#1a1a1a]">
        <CardHeader className="gap-3 border-b border-border/50">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-[#1b1b1b] text-sm font-semibold text-white">
              {model.symbol}
            </div>
            <div className="min-w-0">
              <CardTitle className="truncate text-base text-white">
                {model.name}
              </CardTitle>
              <CardDescription className="line-clamp-2 text-xs text-white/60">
                {model.description}
              </CardDescription>
            </div>
          </div>
          <CardAction>
            <Badge
              variant={stats.running > 0 ? "default" : "outline"}
              className="rounded-full px-2"
            >
              {stats.running > 0 ? `${stats.running} active` : "No active"}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-2 text-xs text-white/60 sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <Calendar className="size-3.5" />
              Added {formatAddedDate(model.addedAt)}
            </div>
            <div className="flex items-center gap-2">
              <Activity className="size-3.5" />
              {stats.total} total runs
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <span className="text-[11px] font-semibold tracking-[0.18em] text-white/40 uppercase">
                Last run
              </span>
              <span>{stats.latestRunLabel ?? "No runs yet"}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {stats.queued > 0 ? (
              <Badge variant="outline">{stats.queued} queued</Badge>
            ) : null}
            {stats.failed > 0 ? (
              <Badge variant="destructive">{stats.failed} failed</Badge>
            ) : null}
            {stats.completed > 0 ? (
              <Badge variant="secondary">{stats.completed} completed</Badge>
            ) : null}
          </div>
        </CardContent>
        <CardFooter className="border-t border-border/50 text-xs text-white/60">
          <span>View evaluations</span>
          <ChevronRight className="ml-auto size-4 text-white/50 transition group-hover:translate-x-0.5" />
        </CardFooter>
      </Card>
    </button>
  )
}
