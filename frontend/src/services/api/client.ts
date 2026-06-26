import createClient from "openapi-fetch"
import type { paths } from "@/types/schema"

export const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000"

export const apiClient = createClient<paths>({
  baseUrl: BASE_URL,
})
