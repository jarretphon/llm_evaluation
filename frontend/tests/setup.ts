import "@testing-library/jest-dom/vitest"
import { afterAll, afterEach } from "vitest"
import { cleanup } from "@testing-library/react"

import { server } from "./mocks/server"

server.listen({ onUnhandledRequest: "error" })

afterEach(() => {
  server.resetHandlers()
  cleanup()
})

afterAll(() => {
  server.close()
})
