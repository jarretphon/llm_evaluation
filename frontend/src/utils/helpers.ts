import { type EvaluationRecord } from "@/data/evaluations"

export function sortEvaluationsBy(
  evaluations: EvaluationRecord[],
  type: string = "date",
  order: "ascending" | "descending"
): EvaluationRecord[] {
  if (type === "date") {
    return [...evaluations].sort((a, b) => {
      const dateA = new Date(a.metadata.start).getTime()
      const dateB = new Date(b.metadata.start).getTime()
      return order === "ascending" ? dateA - dateB : dateB - dateA
    })
  }

  return [...evaluations]
}
