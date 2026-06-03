export interface Model {
  id: string
  symbol: string
  name: string
  description: string
  addedAt: string
}

export const models: Model[] = [
  {
    id: "claude-opus-4-7",
    symbol: "ANTP",
    name: "Claude Opus 4.7",
    description: "Claude Opus 4.7 description",
    addedAt: "2026-05-19",
  },
  {
    id: "gpt-5-5",
    symbol: "OPEN",
    name: "GPT-5.5",
    description: "GPT-5.5 description",
    addedAt: "2026-05-23",
  },
  {
    id: "claude-opus-4-6",
    symbol: "ANTP",
    name: "Claude Opus 4.6",
    description: "Claude Opus 4.6 description",
    addedAt: "2026-04-28",
  },
  {
    id: "gemini-flash-3-5",
    symbol: "GEM",
    name: "Gemini Flash 3.5",
    description: "Gemini Flash 3.5 description",
    addedAt: "2026-05-12",
  },
  {
    id: "deep-seek-2-3",
    symbol: "DS",
    name: "Deep Seek 2.3",
    description: "Deep Seek 2.3 description",
    addedAt: "2026-04-15",
  },
]
