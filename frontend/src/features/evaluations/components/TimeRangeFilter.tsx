import { type DateRange } from "react-day-picker"

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"
import { useIsMobile } from "@/hooks/use-mobile"

export type dateFilter = "today" | "7d" | "30d" | "custom"

const rangeOptions: Array<{ value: dateFilter; label: string }> = [
  { value: "today", label: "Today" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Past month" },
]

export function TimeRangeFilter({
  value,
  setValue,
  customDateRange,
  setCustomDateRange,
}: {
  value: dateFilter
  setValue: (value: dateFilter) => void
  customDateRange: DateRange | undefined
  setCustomDateRange: (dateRange: DateRange | undefined) => void
}) {
  const isMobile = useIsMobile()

  const handleValueChange = (nextValue: dateFilter) => {
    setValue(nextValue)
  }

  return (
    <ToggleGroup
      multiple={false}
      value={value ? [value] : []}
      onValueChange={(nextValue) => {
        const selectedValue = nextValue[0] as dateFilter | undefined

        if (selectedValue) {
          handleValueChange(selectedValue)
        }
      }}
      variant="outline"
      className="w-max"
    >
      {rangeOptions.map((option) => {
        return (
          <ToggleGroupItem key={option.value} value={option.value}>
            {option.label}
          </ToggleGroupItem>
        )
      })}

      <Popover>
        <PopoverTrigger>
          <ToggleGroupItem value="custom">Custom</ToggleGroupItem>
        </PopoverTrigger>

        <PopoverContent align="end" className="w-fit p-0">
          <Calendar
            mode="range"
            defaultMonth={customDateRange?.from}
            selected={customDateRange}
            onSelect={setCustomDateRange}
            numberOfMonths={isMobile ? 1 : 2}
            captionLayout="dropdown"
            disabled={(date) =>
              date > new Date() || date < new Date("1900-01-01")
            }
          />
        </PopoverContent>
      </Popover>
    </ToggleGroup>
  )
}
