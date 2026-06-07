import { ScrollArea } from "@/components/ui/scroll-area"

type data = {
  label: string
  value: string
}

export function EvalDurationStats({ data }: { data: data[] }) {
  return (
    <ScrollArea className="w-full">
      <div className="flex flex-nowrap gap-3">
        {data.map((row) => (
          <div
            key={row.label}
            className="min-w-32 flex-1 rounded-2xl border border-border/50 bg-muted/20 p-3"
          >
            <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
              {row.label}
            </p>
            <p className="mt-2 text-sm font-medium text-foreground">
              {row.value}
            </p>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
