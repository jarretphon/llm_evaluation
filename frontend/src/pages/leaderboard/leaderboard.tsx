import { DataTable } from "@/components/data-table"
import data from "@/data/tableData.json"

import { CollapsibleFileTree } from "@/features/evaluations/components/forms/NewEvaluationForm"

export function Leaderboard() {
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <DataTable data={data} />
      <CollapsibleFileTree />
    </div>
  )
}
