export function formatProgressValue(progress: number): number {
  return Math.round(progress)
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) {
    return "—"
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString()
}
