import { type Benchmark, benchmarks } from "./benchmarks"

export interface BenchmarkCategory {
  id: string
  label: string
  description: string
  benchmarks: Benchmark[]
}

export const benchmarkCategories: BenchmarkCategory[] = [
  {
    id: "reasoning",
    label: "Reasoning",
    description: "Math, logic, and long-context reasoning",
    benchmarks: benchmarks.filter((benchmark) =>
      ["gsm8k", "mmlu", "bbh", "longbench"].includes(benchmark.id)
    ),
  },
  {
    id: "coding",
    label: "Coding",
    description: "Code generation and multi-turn quality",
    benchmarks: benchmarks.filter((benchmark) =>
      ["humaneval", "mt-bench", "arena-hard"].includes(benchmark.id)
    ),
  },
  {
    id: "tooling",
    label: "Tool Use",
    description: "Tool orchestration and function calling",
    benchmarks: benchmarks.filter((benchmark) =>
      ["toolbench", "bfcl", "gorilla", "truthfulqa"].includes(benchmark.id)
    ),
  },
  {
    id: "safety",
    label: "Safety",
    description: "Refusal and safety compliance",
    benchmarks: benchmarks.filter((benchmark) =>
      ["advbench", "safetybench", "wildguard", "refusalqa"].includes(
        benchmark.id
      )
    ),
  },
]
