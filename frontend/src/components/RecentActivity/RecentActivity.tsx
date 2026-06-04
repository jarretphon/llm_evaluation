import { Bot, type LucideIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useState, useRef, useCallback } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"

import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

import { CircleCheckIcon, LoaderIcon, CirclePlus, Trash2 } from "lucide-react"
import { Link } from "react-router-dom"

type ActivityType = "create" | "delete" | "evaluating" | "evaluation_completed"

type Activity = {
  id: string
  type: ActivityType
  modelName: string
  benchmark?: number
  timestamp: string
  icon: LucideIcon
}

const activities: Activity[] = [
  {
    id: "txn_1",
    type: "create",
    modelName: "Claude Opus 4.6",
    timestamp: "Today, 10:24 AM",
    icon: Bot,
  },
  {
    id: "txn_2",
    type: "evaluating",
    modelName: "GPT 5.5",
    benchmark: 12,
    timestamp: "Yesterday",
    icon: Bot,
  },
  {
    id: "txn_3",
    type: "evaluation_completed",
    modelName: "Claude Opus 4.7",
    benchmark: 17,
    timestamp: "Oct 12",
    icon: Bot,
  },
  {
    id: "txn_4",
    type: "create",
    modelName: "Gemini 2.5 Pro",
    timestamp: "Oct 11",
    icon: Bot,
  },
  {
    id: "txn_5",
    type: "evaluating",
    modelName: "Gemini 3.5 Flash",
    benchmark: 20,
    timestamp: "Oct 10",
    icon: Bot,
  },
]

const formatBadgeDisplay = (activityType: ActivityType) => {
  switch (activityType) {
    case "create":
      return {
        Icon: CirclePlus,
        text: "Created",
        iconClassName: "fill-blue-400 text-blue-400",
        className: "border-blue-500/20 bg-blue-500/10 text-blue-400",
      }
    case "delete":
      return {
        Icon: Trash2,
        text: "Deleted",
        iconClassName: "fill-rose-400 text-rose-400",
        className: "border-rose-500/20 bg-rose-500/10 text-rose-400",
      }
    case "evaluating":
      return {
        Icon: LoaderIcon,
        text: "In Process",
        iconClassName: "fill-amber-400 text-amber-400",
        className: "border-amber-500/20 bg-amber-500/10 text-amber-400",
      }
    case "evaluation_completed":
      return {
        Icon: CircleCheckIcon,
        text: "Done",
        iconClassName: "fill-emerald-500 dark:fill-emerald-400",
        className: " border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
      }
    default:
      return { Icon: null, text: "", iconClassName: "", className: "" }
  }
}

const formatActivityDescription = (activityType: ActivityType) => {
  switch (activityType) {
    case "create":
      return "Create"
    case "delete":
      return "Delete"
    case "evaluating":
      return "Evaluation"
    case "evaluation_completed":
      return "Evaluation"
    default:
      return ""
  }
}

const ActivityBadge = ({ activityType }: { activityType: ActivityType }) => {
  const { Icon, text, iconClassName, className } =
    formatBadgeDisplay(activityType)

  return (
    <Badge variant="outline" className={`px-1.5 ${className}`}>
      {Icon && <Icon className={`size-4 ${iconClassName}`} />}
      {text}
    </Badge>
  )
}

export function RecentActivityTable() {
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const [isAtBottom, setIsAtBottom] = useState(false)

  const updateScrollState = useCallback(() => {
    const element = scrollRef.current

    if (!element) {
      return
    }

    const reachedBottom =
      element.scrollTop + element.clientHeight >= element.scrollHeight - 1

    setIsAtBottom(reachedBottom)
  }, [])

  return (
    <Card className="w-full gap-2 overflow-hidden rounded-2xl border-white/10 bg-[#171717] text-white shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="text-base font-semibold tracking-tight text-white">
            Recent Activity
          </CardTitle>
          <CardDescription className="mt-1 text-sm">
            Your latest account activity.
          </CardDescription>
        </div>

        <Link to="/evaluations">
          <Button
            variant={isAtBottom ? "default" : "outline"}
            className="cursor-pointer rounded-lg"
          >
            View All
          </Button>
        </Link>
      </CardHeader>

      <CardContent className="p-0">
        <div
          ref={scrollRef}
          onScroll={updateScrollState}
          className="recent-activity-scroll h-90 overflow-y-auto"
        >
          <Table>
            <TableBody>
              {activities.map((activity) => {
                return (
                  <TableRow key={activity.id} className="border-white/10">
                    <TableCell className="px-6 py-3">
                      <div className="min-w-0 flex-1">
                        <div className="grid grid-cols-3 items-start gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-sm leading-5 font-semibold">
                              {activity.modelName}
                            </p>
                            <p className="truncate text-sm leading-5 text-zinc-400">
                              {formatActivityDescription(activity.type)}
                            </p>
                          </div>

                          <div className="justify-self-center text-center">
                            <p className="py-0.5 text-xs whitespace-nowrap text-zinc-400">
                              {activity.benchmark !== undefined
                                ? `${activity.benchmark} metrics`
                                : null}
                            </p>
                            {activity.type === "evaluation_completed" && (
                              <p className="py-0.5 text-xs font-medium text-zinc-400">
                                Started: Oct 12
                              </p>
                            )}
                          </div>

                          <div className="flex flex-col items-end text-right">
                            <ActivityBadge activityType={activity.type} />
                            <p className="truncate px-2 text-xs leading-5 text-zinc-400">
                              {activity.timestamp}
                            </p>
                          </div>
                        </div>

                        {activity.type === "evaluating" && (
                          <div className="mt-1 flex items-center gap-3">
                            <Progress value={66} className="min-w-0 flex-1" />
                            <span className="text-xs font-medium text-zinc-400">
                              66%
                            </span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
