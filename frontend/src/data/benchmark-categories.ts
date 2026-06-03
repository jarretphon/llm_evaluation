export interface BenchmarkCategory {
  id: string
  label: string
  description: string
  benchmarkIds: string[]
}

export const benchmarkCategories: BenchmarkCategory[] = [
  {
    id: "reasoning",
    label: "Reasoning",
    description: "Math, logic, and long-context reasoning",
    benchmarkIds: ["gsm8k", "mmlu", "bbh", "longbench"],
  },
  {
    id: "coding",
    label: "Coding",
    description: "Code generation and multi-turn quality",
    benchmarkIds: ["humaneval", "mt-bench", "arena-hard", "api-bank"],
  },
  {
    id: "tooling",
    label: "Tool Use",
    description: "Tool orchestration and function calling",
    benchmarkIds: ["toolbench", "bfcl", "gorilla", "truthfulqa"],
  },
  {
    id: "safety",
    label: "Safety",
    description: "Refusal and safety compliance",
    benchmarkIds: ["advbench", "safetybench", "wildguard", "refusalqa"],
  },
]
