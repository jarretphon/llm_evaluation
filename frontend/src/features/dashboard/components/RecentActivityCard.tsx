import {
  CheckCircle2,
  FlaskConical,
  PlusCircle,
  type LucideIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { TableCell, TableRow } from "@/components/ui/table"

export type ActivityType =
  | "model_added"
  | "evaluation_active"
  | "evaluation_completed"

export type RecentActivity = {
  id: string
  type: ActivityType
  modelName: string
  timestamp: string
  benchmark?: string
  duration?: string
}

type ActivityConfig = {
  label: string
  icon: LucideIcon
  badgeClassName: string
  iconClassName: string
  title: (activity: RecentActivity) => string
  description: (activity: RecentActivity) => string
}

const activityConfig: Record<ActivityType, ActivityConfig> = {
  model_added: {
    label: "Model Added",
    icon: PlusCircle,
    badgeClassName:
      "border-blue-500/20 bg-blue-500/10 text-blue-400 hover:bg-blue-500/10",
    iconClassName: "bg-blue-500/10 text-blue-400",
    title: (activity) => `${activity.modelName} was added`,
    description: () => "A new model has been registered to the application",
  },

  evaluation_active: {
    label: "Evaluating",
    icon: FlaskConical,
    badgeClassName:
      "border-amber-500/20 bg-amber-500/10 text-amber-400 hover:bg-amber-500/10",
    iconClassName: "bg-amber-500/10 text-amber-400",
    title: (activity) => `${activity.modelName} is being evaluated`,
    description: (activity) => {
      const details = []

      if (activity.benchmark) details.push(activity.benchmark)
      if (activity.duration) details.push(activity.duration)

      return details.length > 0
        ? details.join(" · ")
        : "Evaluation is currently in progress"
    },
  },

  evaluation_completed: {
    label: "Completed",
    icon: CheckCircle2,
    badgeClassName:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/10",
    iconClassName: "bg-emerald-500/10 text-emerald-400",
    title: (activity) => `${activity.modelName} completed evaluation`,
    description: (activity) => {
      const details = []

      if (activity.benchmark) details.push(activity.benchmark)
      if (activity.duration) details.push(activity.duration)

      return details.length > 0
        ? details.join(" · ")
        : "Evaluation finished successfully"
    },
  },
}

export function RecentActivityRow({ activity }: { activity: RecentActivity }) {
  const config = activityConfig[activity.type]
  const Icon = config.icon

  return (
    <TableRow key={activity.id} className="border-white/10">
      <TableCell className="w-[46%] py-3 pr-3 pl-3 sm:pl-5">
        <div className="flex items-center gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-zinc-800">
            <Icon className="size-4" strokeWidth={2} />
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm leading-5 font-semibold text-white">
              {activity.modelName}
            </p>
            <p className="truncate text-sm leading-5 text-zinc-400">
              {activity.benchmark}
            </p>
          </div>
        </div>
      </TableCell>

      <TableCell className="hidden w-[28%] py-3 text-sm text-zinc-400 sm:table-cell">
        {activity.timestamp}
      </TableCell>

      <TableCell className="py-3 pr-4 pl-3 text-right text-sm font-semibold sm:pr-5">
        <Badge>{activity.type}</Badge>
      </TableCell>
    </TableRow>
  )
}
