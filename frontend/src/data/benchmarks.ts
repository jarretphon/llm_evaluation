import type { EvaluationStatus } from "./evaluations"

export interface Benchmark {
  id: string
  name: string
  description: string
}

export interface BenchmarkRecord {
  benchmark: Benchmark
  status: EvaluationStatus
  progress?: number
  score?: number
}

export const benchmarks: Benchmark[] = [
  {
    id: "gsm8k",
    name: "GSM8K",
    description: "Arithmetic and grade-school math.",
  },
  {
    id: "mmlu",
    name: "MMLU",
    description: "Broad multitask knowledge and reasoning.",
  },
  {
    id: "bbh",
    name: "BBH",
    description: "Hard reasoning and multi-step tasks.",
  },
  {
    id: "humaneval",
    name: "HumanEval",
    description: "Python code generation and correctness.",
  },
  {
    id: "mt-bench",
    name: "MT-Bench",
    description: "Multi-turn chat quality.",
  },
  {
    id: "arena-hard",
    name: "Arena-Hard",
    description: "Challenging preference and response quality.",
  },
  {
    id: "truthfulqa",
    name: "TruthfulQA",
    description: "Truthfulness and hallucination resistance.",
  },
  {
    id: "longbench",
    name: "LongBench",
    description: "Long-context comprehension.",
  },
  {
    id: "toolbench",
    name: "ToolBench",
    description: "Tool use and orchestration.",
  },
  {
    id: "bfcl",
    name: "BFCL",
    description: "Function calling reliability.",
  },
  {
    id: "api-bank",
    name: "API-Bank",
    description: "API selection and call planning.",
  },
  {
    id: "gorilla",
    name: "Gorilla",
    description: "Tool-augmented instruction following.",
  },
  {
    id: "advbench",
    name: "AdvBench",
    description: "Adversarial safety prompts.",
  },
  {
    id: "safetybench",
    name: "SafetyBench",
    description: "Policy compliance and refusal quality.",
  },
  {
    id: "wildguard",
    name: "WildGuard",
    description: "Unsafe content detection and mitigation.",
  },
  {
    id: "refusalqa",
    name: "RefusalQA",
    description: "Appropriate refusal behavior.",
  },
]
