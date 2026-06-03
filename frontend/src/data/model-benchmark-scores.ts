const hashString = (value: string) => {
  let hash = 0

  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i)
    hash |= 0
  }

  return Math.abs(hash)
}

export const getBenchmarkScore = (modelId: string, benchmarkId: string) => {
  const seed = hashString(`${modelId}:${benchmarkId}`)
  const normalized = Math.abs(Math.sin(seed))

  return Math.round(40 + normalized * 60)
}
