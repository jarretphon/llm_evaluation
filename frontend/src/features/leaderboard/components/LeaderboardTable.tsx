import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useGetLeaderboard } from "../hooks/queries/useLeaderboard"
import type { CSSProperties } from "react"

const formatScore = (value: number | null | undefined) => {
  if (value === null || value === undefined) {
    return "—"
  }

  return value.toFixed(4)
}

const getScorePercentage = (value: number | null | undefined) => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return null
  }

  const normalizedValue = value > 1 ? value / 100 : value
  return Math.max(0, Math.min(normalizedValue, 1)) * 100
}

const getScoreGradient = (value: number | null | undefined) => {
  const percentage = getScorePercentage(value)

  if (percentage === null) {
    return undefined
  }

  const hue = percentage < 50 ? percentage * 1.1 : 55 + (percentage - 50) * 1.3
  const fill = `hsla(${hue}, 78%, 42%, 0.36)`
  const edge = `hsla(${hue}, 78%, 48%, 0.2)`

  return `linear-gradient(90deg, ${fill} 0%, ${edge} ${percentage}%, rgba(255,255,255,0.035) ${percentage}%, rgba(255,255,255,0.015) 100%)`
}

export function LeaderboardTable({
  selectedBenchmarks,
}: {
  selectedBenchmarks: string[]
}) {
  const { data, isPending, error } = useGetLeaderboard(selectedBenchmarks)

  if (isPending) {
    return (
      <div className="rounded-lg border border-white/10 bg-[#151515] p-8 text-center text-sm text-white/60">
        Loading leaderboard...
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-500/30 bg-[#151515] p-8 text-center text-sm text-red-300">
        Failed to load leaderboard: {error.message}
      </div>
    )
  }

  const scoreColumnCount = selectedBenchmarks.length + 1
  const scoreColumnWidth = `${100 / scoreColumnCount}%`
  const scoreColumnStyle = {
    minWidth: "12rem",
    width: scoreColumnWidth,
  }
  const getScoreCellStyle = (
    value: number | null | undefined
  ): CSSProperties => ({
    ...scoreColumnStyle,
    background: getScoreGradient(value),
  })

  return (
    <div className="recent-activity-scroll w-full overflow-auto rounded-lg border border-white/10 text-white">
      <Table className="min-w-full table-auto border border-white/10 text-white">
        <TableHeader>
          <TableRow className="border-white/10 hover:bg-transparent">
            <TableHead className="w-px border text-center whitespace-nowrap text-white/60">
              Rank
            </TableHead>
            <TableHead className="w-px border whitespace-nowrap text-white/60">
              Model
            </TableHead>
            <TableHead
              className="border whitespace-nowrap text-white/60"
              style={scoreColumnStyle}
            >
              Average
            </TableHead>
            {data.selected_benchmarks.map((benchmark) => (
              <TableHead
                key={benchmark}
                className="border whitespace-nowrap text-white/60"
                style={scoreColumnStyle}
              >
                <span className="block">{benchmark}</span>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.rows.map((row) => (
            <TableRow key={row.model_id} className="border-white/10">
              <TableCell className="w-px text-center font-medium whitespace-nowrap text-white">
                {row.rank ?? "—"}
              </TableCell>
              <TableCell className="w-px border whitespace-nowrap">
                <div className="flex flex-col gap-1">
                  <span className="font-medium text-white">
                    {row.model_name}
                  </span>
                </div>
              </TableCell>
              <TableCell
                className="border font-medium whitespace-nowrap text-white"
                style={getScoreCellStyle(row.weighted_average)}
              >
                {formatScore(row.weighted_average)}
              </TableCell>
              {data.selected_benchmarks.map((benchmark) => {
                const score = row.scores[benchmark]

                return (
                  <TableCell
                    key={benchmark}
                    className="border whitespace-nowrap"
                    style={getScoreCellStyle(score?.value)}
                  >
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-white">
                        {formatScore(score?.value)}
                      </span>
                      {score?.metric && (
                        <span className="text-xs text-white/45">
                          {score.metric} | n={score.effective_sample_count}
                        </span>
                      )}
                    </div>
                  </TableCell>
                )
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
