import { SectionCards } from "@/components/section-cards"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { RecentActivityTable } from "@/components/RecentActivity/RecentActivity"

import data from "../app/dashboard/data.json"

export function Dashboard() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <SectionCards />
          <div className="grid items-stretch gap-4 px-4 lg:px-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] 2xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <div>
              <ChartAreaInteractive />
            </div>
            <div>
              <RecentActivityTable />
            </div>
          </div>
          <DataTable data={data} />
        </div>
      </div>
    </div>
  )
}
