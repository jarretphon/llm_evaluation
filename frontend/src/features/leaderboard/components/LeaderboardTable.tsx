import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { LeaderboardRead } from "@/features/leaderboard/schemas/leaderboard"

const formatScore = (value: number | null | undefined) => {
  if (value === null || value === undefined) {
    return "—"
  }

  return value.toFixed(4)
}

export function LeaderboardTable({
  leaderboard,
}: {
  leaderboard: LeaderboardRead
}) {
  const scoreColumnCount = leaderboard.selected_benchmarks.length + 1
  const scoreColumnWidth = `${100 / scoreColumnCount}%`
  const scoreColumnStyle = {
    minWidth: "12rem",
    width: scoreColumnWidth,
  }

  return (
    <div className="w-full overflow-auto rounded-lg border border-white/10 text-white">
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
            {leaderboard.selected_benchmarks.map((benchmark) => (
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
          {leaderboard.rows.map((row) => (
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
                style={scoreColumnStyle}
              >
                {formatScore(row.weighted_average)}
              </TableCell>
              {leaderboard.selected_benchmarks.map((benchmark) => {
                const score = row.scores[benchmark]

                return (
                  <TableCell
                    key={benchmark}
                    className="border whitespace-nowrap"
                    style={scoreColumnStyle}
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
