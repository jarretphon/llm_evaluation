import { useState, useEffect, useCallback } from "react"

export function useFetch<T>(url: string, options?: RequestInit) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const optionsString = JSON.stringify(options || {})

  const fetchData = useCallback(
    async (abortSignal?: AbortSignal) => {
      const sleep = (ms: number) =>
        new Promise((resolve) => setTimeout(resolve, ms))

      setLoading(true)
      setError(null)
      try {
        //await sleep(5000)
        const response = await fetch(url, {
          ...options,
          signal: abortSignal || options?.signal,
        })
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }
        // Handle cases with no response body
        if (response.status !== 200) {
          setData(null)
        } else {
          const result = (await response.json()) as T
          setData(result)
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          console.log("Fetch aborted")
          return
        }
        if (error instanceof Error) {
          setError(error)
        } else {
          setError(new Error("An unknown error occurred"))
        }
      } finally {
        setLoading(false)
      }
    },
    // Stringify the options object to prevent infinite loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [url, optionsString]
  )

  useEffect(() => {
    const controller = new AbortController()
    fetchData(controller.signal)
    return () => {
      controller.abort()
    }
  }, [fetchData])
  return { data, loading, error, refetch: fetchData }
}
