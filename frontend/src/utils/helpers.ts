import type { components } from "@/types/schema"
type EvaluationRecord = components["schemas"]["EvaluationRead"]

export function sortEvaluationsBy(
  evaluations: EvaluationRecord[],
  type: string = "date",
  order: "ascending" | "descending"
): EvaluationRecord[] {
  if (type === "date") {
    return [...evaluations].sort((a, b) => {
      const dateA = new Date(a.metadata_entry.started_at).getTime()
      const dateB = new Date(b.metadata_entry.started_at).getTime()
      return order === "ascending" ? dateA - dateB : dateB - dateA
    })
  }

  return [...evaluations]
}
