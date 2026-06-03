import { benchmarks } from "@/data/benchmarks"
import { type EvaluationRecord } from "@/data/evaluations"

export interface Model {
  id: string
  symbol: string
  name: string
  description: string
  addedAt: string
  evaluations: EvaluationRecord[]
}

export const models: Model[] = [
  {
    id: "claude-opus-4-7",
    symbol: "ANTP",
    name: "Claude Opus 4.7",
    description:
      "Frontier reasoning model tuned for long-form analysis, tool use, and high-accuracy evaluation tasks.",
    addedAt: "2026-05-19",
    evaluations: [
      {
        id: "claude-opus-4-7-eval-20260603-regression",
        metadata: {
          start: "2026-06-03 09:20",
          duration: "1h 12m",
          estimatedEnd: "2026-06-03 10:32",
          progress: 64,
        },
        evalStatus: "running",
        benchmarkRecords: [
          {
            benchmark: benchmarks[0],
            status: "completed",
            progress: 100,
            score: 94,
          },
          {
            benchmark: benchmarks[1],
            status: "completed",
            progress: 100,
            score: 89,
          },
          {
            benchmark: benchmarks[2],
            status: "completed",
            progress: 100,
            score: 86,
          },
          {
            benchmark: benchmarks[7],
            status: "running",
            progress: 72,
          },
          {
            benchmark: benchmarks[8],
            status: "running",
            progress: 38,
          },
        ],
      },
      {
        id: "claude-opus-4-7-eval-20260601-release",
        metadata: {
          start: "2026-06-01 14:10",
          duration: "1h 18m",
          end: "2026-06-01 15:28",
        },
        evalStatus: "completed",
        benchmarkRecords: [
          {
            benchmark: benchmarks[0],
            status: "completed",
            progress: 100,
            score: 95,
          },
          {
            benchmark: benchmarks[1],
            status: "completed",
            progress: 100,
            score: 90,
          },
          {
            benchmark: benchmarks[2],
            status: "completed",
            progress: 100,
            score: 87,
          },
          {
            benchmark: benchmarks[6],
            status: "completed",
            progress: 100,
            score: 84,
          },
          {
            benchmark: benchmarks[13],
            status: "completed",
            progress: 100,
            score: 92,
          },
        ],
      },
      {
        id: "claude-opus-4-7-eval-20260524-safety",
        metadata: {
          start: "2026-05-24 16:45",
          duration: "52 min",
          end: "2026-05-24 17:37",
        },
        evalStatus: "completed",
        benchmarkRecords: [
          {
            benchmark: benchmarks[12],
            status: "completed",
            progress: 100,
            score: 91,
          },
          {
            benchmark: benchmarks[13],
            status: "completed",
            progress: 100,
            score: 94,
          },
          {
            benchmark: benchmarks[14],
            status: "completed",
            progress: 100,
            score: 88,
          },
          {
            benchmark: benchmarks[15],
            status: "completed",
            progress: 100,
            score: 90,
          },
        ],
      },
    ],
  },
  {
    id: "gpt-5-5",
    symbol: "OPEN",
    name: "GPT-5.5",
    description:
      "General-purpose multimodal model with strong coding, instruction following, and benchmark stability.",
    addedAt: "2026-05-23",
    evaluations: [
      {
        id: "gpt-5-5-eval-20260603-tooling",
        metadata: {
          start: "2026-06-03 08:15",
          duration: "56 min",
          end: "2026-06-03 09:11",
        },
        evalStatus: "completed",
        benchmarkRecords: [
          {
            benchmark: benchmarks[8],
            status: "completed",
            progress: 100,
            score: 93,
          },
          {
            benchmark: benchmarks[9],
            status: "completed",
            progress: 100,
            score: 96,
          },
          {
            benchmark: benchmarks[10],
            status: "completed",
            progress: 100,
            score: 91,
          },
          {
            benchmark: benchmarks[11],
            status: "completed",
            progress: 100,
            score: 94,
          },
        ],
      },
      {
        id: "gpt-5-5-eval-20260602-coding",
        metadata: {
          start: "2026-06-02 21:40",
          duration: "1h 06m",
          estimatedEnd: "2026-06-02 22:46",
          progress: 43,
        },
        evalStatus: "running",
        benchmarkRecords: [
          {
            benchmark: benchmarks[3],
            status: "completed",
            progress: 100,
            score: 92,
          },
          {
            benchmark: benchmarks[4],
            status: "running",
            progress: 58,
          },
          {
            benchmark: benchmarks[5],
            status: "running",
            progress: 35,
          },
          {
            benchmark: benchmarks[6],
            status: "queued",
            progress: 0,
          },
        ],
      },
      {
        id: "gpt-5-5-eval-20260527-safety",
        metadata: {
          start: "2026-05-27 11:20",
          duration: "37 min",
          end: "2026-05-27 11:57",
        },
        evalStatus: "completed",
        benchmarkRecords: [
          {
            benchmark: benchmarks[12],
            status: "completed",
            progress: 100,
            score: 88,
          },
          {
            benchmark: benchmarks[13],
            status: "completed",
            progress: 100,
            score: 93,
          },
          {
            benchmark: benchmarks[14],
            status: "completed",
            progress: 100,
            score: 89,
          },
          {
            benchmark: benchmarks[15],
            status: "completed",
            progress: 100,
            score: 91,
          },
        ],
      },
    ],
  },
  {
    id: "claude-opus-4-6",
    symbol: "ANTP",
    name: "Claude Opus 4.6",
    description:
      "Previous production reasoning model used as a baseline for regression and latency comparisons.",
    addedAt: "2026-04-28",
    evaluations: [
      {
        id: "claude-opus-4-6-eval-20260602-baseline",
        metadata: {
          start: "2026-06-02 10:05",
          duration: "1h 04m",
          end: "2026-06-02 11:09",
        },
        evalStatus: "completed",
        benchmarkRecords: [
          {
            benchmark: benchmarks[0],
            status: "completed",
            progress: 100,
            score: 91,
          },
          {
            benchmark: benchmarks[1],
            status: "completed",
            progress: 100,
            score: 86,
          },
          {
            benchmark: benchmarks[2],
            status: "completed",
            progress: 100,
            score: 82,
          },
          {
            benchmark: benchmarks[7],
            status: "completed",
            progress: 100,
            score: 80,
          },
        ],
      },
      {
        id: "claude-opus-4-6-eval-20260603-parity",
        metadata: {
          start: "2026-06-03 10:45",
          duration: "49 min",
          estimatedEnd: "2026-06-03 11:34",
          progress: 29,
        },
        evalStatus: "running",
        benchmarkRecords: [
          {
            benchmark: benchmarks[6],
            status: "completed",
            progress: 100,
            score: 81,
          },
          {
            benchmark: benchmarks[8],
            status: "running",
            progress: 46,
          },
          {
            benchmark: benchmarks[9],
            status: "running",
            progress: 25,
          },
          {
            benchmark: benchmarks[10],
            status: "queued",
            progress: 0,
          },
        ],
      },
      {
        id: "claude-opus-4-6-eval-20260530-regression",
        metadata: {
          start: "2026-05-30 17:00",
          duration: "42 min",
          end: "2026-05-30 17:42",
        },
        evalStatus: "completed",
        benchmarkRecords: [
          {
            benchmark: benchmarks[3],
            status: "completed",
            progress: 100,
            score: 84,
          },
          {
            benchmark: benchmarks[4],
            status: "completed",
            progress: 100,
            score: 82,
          },
          {
            benchmark: benchmarks[5],
            status: "completed",
            progress: 100,
            score: 79,
          },
        ],
      },
    ],
  },
  {
    id: "gemini-flash-3-5",
    symbol: "GEM",
    name: "Gemini Flash 3.5",
    description:
      "Low-latency model optimized for high-volume evaluation sweeps and fast interactive workloads.",
    addedAt: "2026-05-12",
    evaluations: [
      {
        id: "gemini-flash-3-5-eval-20260603-latency",
        metadata: {
          start: "2026-06-03 10:20",
          duration: "28 min",
          estimatedEnd: "2026-06-03 10:48",
          progress: 82,
        },
        evalStatus: "running",
        benchmarkRecords: [
          {
            benchmark: benchmarks[4],
            status: "completed",
            progress: 100,
            score: 78,
          },
          {
            benchmark: benchmarks[10],
            status: "completed",
            progress: 100,
            score: 83,
          },
          {
            benchmark: benchmarks[9],
            status: "completed",
            progress: 100,
            score: 86,
          },
          {
            benchmark: benchmarks[5],
            status: "running",
            progress: 61,
          },
        ],
      },
      {
        id: "gemini-flash-3-5-eval-20260601-volume",
        metadata: {
          start: "2026-06-01 09:10",
          duration: "33 min",
          end: "2026-06-01 09:43",
        },
        evalStatus: "completed",
        benchmarkRecords: [
          {
            benchmark: benchmarks[0],
            status: "completed",
            progress: 100,
            score: 83,
          },
          {
            benchmark: benchmarks[3],
            status: "completed",
            progress: 100,
            score: 80,
          },
          {
            benchmark: benchmarks[8],
            status: "completed",
            progress: 100,
            score: 84,
          },
          {
            benchmark: benchmarks[14],
            status: "completed",
            progress: 100,
            score: 86,
          },
        ],
      },
      {
        id: "gemini-flash-3-5-eval-20260518-safety",
        metadata: {
          start: "2026-05-18 13:35",
          duration: "28 min",
          end: "2026-05-18 14:03",
        },
        evalStatus: "completed",
        benchmarkRecords: [
          {
            benchmark: benchmarks[12],
            status: "completed",
            progress: 100,
            score: 82,
          },
          {
            benchmark: benchmarks[13],
            status: "completed",
            progress: 100,
            score: 87,
          },
          {
            benchmark: benchmarks[15],
            status: "completed",
            progress: 100,
            score: 85,
          },
        ],
      },
    ],
  },
  {
    id: "deep-seek-2-3",
    symbol: "DS",
    name: "Deep Seek 2.3",
    description:
      "Reasoning and code-focused model with competitive math performance and efficient inference cost.",
    addedAt: "2026-04-15",
    evaluations: [
      {
        id: "deep-seek-2-3-eval-20260603-reasoning",
        metadata: {
          start: "2026-06-03 07:55",
          duration: "1h 09m",
          estimatedEnd: "2026-06-03 09:04",
          progress: 91,
        },
        evalStatus: "running",
        benchmarkRecords: [
          {
            benchmark: benchmarks[0],
            status: "completed",
            progress: 100,
            score: 92,
          },
          {
            benchmark: benchmarks[1],
            status: "completed",
            progress: 100,
            score: 84,
          },
          {
            benchmark: benchmarks[2],
            status: "completed",
            progress: 100,
            score: 85,
          },
          {
            benchmark: benchmarks[7],
            status: "completed",
            progress: 100,
            score: 78,
          },
          {
            benchmark: benchmarks[6],
            status: "running",
            progress: 73,
          },
        ],
      },
      {
        id: "deep-seek-2-3-eval-20260602-code",
        metadata: {
          start: "2026-06-02 15:25",
          duration: "44 min",
          end: "2026-06-02 16:09",
        },
        evalStatus: "completed",
        benchmarkRecords: [
          {
            benchmark: benchmarks[3],
            status: "completed",
            progress: 100,
            score: 90,
          },
          {
            benchmark: benchmarks[4],
            status: "completed",
            progress: 100,
            score: 81,
          },
          {
            benchmark: benchmarks[10],
            status: "completed",
            progress: 100,
            score: 82,
          },
          {
            benchmark: benchmarks[11],
            status: "completed",
            progress: 100,
            score: 85,
          },
        ],
      },
      {
        id: "deep-seek-2-3-eval-20260525-safety",
        metadata: {
          start: "2026-05-25 12:30",
          duration: "35 min",
          end: "2026-05-25 13:05",
        },
        evalStatus: "completed",
        benchmarkRecords: [
          {
            benchmark: benchmarks[12],
            status: "completed",
            progress: 100,
            score: 79,
          },
          {
            benchmark: benchmarks[13],
            status: "completed",
            progress: 100,
            score: 84,
          },
          {
            benchmark: benchmarks[14],
            status: "completed",
            progress: 100,
            score: 81,
          },
          {
            benchmark: benchmarks[15],
            status: "completed",
            progress: 100,
            score: 83,
          },
        ],
      },
    ],
  },
]
