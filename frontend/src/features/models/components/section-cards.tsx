"use client"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { TrendingUpIcon, Clock, CircleAlert } from "lucide-react"

const data = [
  {
    header: "Total Models",
    data: "33",
    icon: TrendingUpIcon,
    badgeData: "+6 models",
    subtext1: "+6 new additions this month",
    subtext2: "Model added in the past month",
  },
  {
    header: "Active Evaluations",
    data: "6",
    icon: Clock,
    badgeData: "Est. 3hr 28min",
    subtext1: "Estimated completion time: 3hr 28min",
    subtext2: "Evaluation in progress",
  },
  {
    header: "Completed Today",
    data: "17",
    icon: CircleAlert,
    badgeData: "2",
    subtext1: "2 failed jobs",
    subtext2: "Evaluation needs attention",
  },
  {
    header: "Growth Rate",
    data: "4.5%",
    icon: TrendingUpIcon,
    badgeData: "4.5%",
    subtext1: "Steady performance increase",
    subtext2: "Meets growth projections",
  },
]

export function SectionCards() {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      {data.map((item) => (
        <Card key={item.header} className="@container/card">
          <CardHeader>
            <CardDescription>{item.header}</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {item.data}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <item.icon />
                {item.badgeData}
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex items-center gap-2 font-medium">
              <item.icon className="size-4" />
              {item.subtext1}
            </div>
            <div className="text-muted-foreground">{item.subtext2}</div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
