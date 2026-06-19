import { DataTable } from "@/components/data-table"
import data from "@/data/tableData.json"

export function Leaderboard() {
  return (
    <div className="flex h-full items-center justify-center">
      <DataTable data={data} />
    </div>
  )
}
