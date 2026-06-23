import { Check, Minus } from "lucide-react"

export type CheckboxState = "checked" | "unchecked" | "indeterminate"

export function TriCheckbox({
  state,
  onClick,
}: {
  state: CheckboxState
  onClick: () => void
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={state === "indeterminate" ? "mixed" : state === "checked"}
      onClick={onClick}
      className={[
        "peer relative flex size-4 shrink-0 items-center justify-center rounded-[5px] border border-transparent bg-input/90 transition-shadow outline-none group-has-disabled/field:opacity-50 after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 aria-invalid:aria-checked:border-primary dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground dark:data-checked:bg-primary",
        state === "unchecked"
          ? "bg-background"
          : "bg-primary text-primary-foreground",
      ].join(" ")}
    >
      {state === "checked" && <Check strokeWidth={3} />}
      {state === "indeterminate" && <Minus strokeWidth={3} />}
    </button>
  )
}
