import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { LeaderboardRead } from "@/features/leaderboard/schemas/leaderboard"

type LeaderboardTableProps = {
  leaderboard: LeaderboardRead
}

const formatScore = (value: number | null | undefined) => {
  if (value === null || value === undefined) {
    return "—"
  }

  return value.toFixed(4)
}

export function LeaderboardTable({ leaderboard }: LeaderboardTableProps) {
  return (
    <Card className="min-w-0 rounded-lg border border-border/60 bg-[#151515] text-white">
      <CardHeader>
        <CardTitle className="text-lg text-white">Leaderboard</CardTitle>
      </CardHeader>
      <CardContent className="min-w-0">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-white/60">Rank</TableHead>
              <TableHead className="min-w-52 text-white/60">Model</TableHead>
              <TableHead className="text-right text-white/60">Average</TableHead>
              {leaderboard.selected_benchmarks.map((benchmark) => (
                <TableHead
                  key={benchmark}
                  className="min-w-32 text-right text-white/60"
                >
                  {benchmark}
                </TableHead>
              ))}
              <TableHead className="text-right text-white/60">Coverage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaderboard.rows.map((row) => (
              <TableRow key={row.model_id} className="border-white/10">
                <TableCell className="font-medium text-white">
                  {row.rank ?? "—"}
                </TableCell>
                <TableCell>
                  <div className="flex min-w-0 flex-col gap-1">
                    <span className="truncate font-medium text-white">
                      {row.model_name}
                    </span>
                    <span className="text-xs text-white/45">{row.provider}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium text-white">
                  {formatScore(row.weighted_average)}
                </TableCell>
                {leaderboard.selected_benchmarks.map((benchmark) => {
                  const score = row.scores[benchmark]

                  return (
                    <TableCell key={benchmark} className="text-right">
                      <div className="flex flex-col items-end gap-1">
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
                <TableCell className="text-right">
                  <Badge
                    variant="outline"
                    className="rounded-full px-2 text-white/70"
                  >
                    {row.completed_benchmark_count}/
                    {row.selected_benchmark_count}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
