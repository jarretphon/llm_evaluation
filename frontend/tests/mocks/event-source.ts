import { vi } from "vitest"

type EventSourceListener = (event: MessageEvent<string>) => void

export class MockEventSource {
  static instances: MockEventSource[] = []

  url: string
  listeners: Record<string, EventSourceListener[]> = {}
  close = vi.fn()

  constructor(url: string) {
    this.url = url
    MockEventSource.instances.push(this)
  }

  addEventListener(eventName: string, listener: EventSourceListener) {
    this.listeners[eventName] = [...(this.listeners[eventName] ?? []), listener]
  }

  removeEventListener(eventName: string, listener: EventSourceListener) {
    this.listeners[eventName] = (this.listeners[eventName] ?? []).filter(
      (currentListener) => currentListener !== listener
    )
  }

  emit(eventName: string, data: unknown) {
    const event = new MessageEvent(eventName, {
      data: JSON.stringify(data),
    })
    this.listeners[eventName]?.forEach((listener) => listener(event))
  }
}

export function installMockEventSource() {
  MockEventSource.instances = []
  vi.stubGlobal("EventSource", MockEventSource)

  return MockEventSource
}
