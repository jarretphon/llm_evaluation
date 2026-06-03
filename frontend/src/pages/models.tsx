import { ArrowLeft, CirclePlay } from "lucide-react"
import { useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

import { CurrentEvalModal } from "@/components/CurrentEvalModal/CurrentEvalModal"
import { NewEvalModal } from "@/components/NewEvalModal/NewEvalModal"
import { ModelCardGrid } from "@/components/models/model-card-grid"
import { ModelEvaluationPanel } from "@/components/models/model-evaluation-panel"
import type { ModelRunStats } from "@/components/models/model-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { benchmarks } from "@/data/benchmarks"
import type { EvaluationRecord } from "@/data/evaluations"
import { modelEvaluationRuns } from "@/data/model-evaluation-runs"
import type { ModelEvaluationRun } from "@/data/model-evaluation-runs"
import { models, type Model } from "@/data/models"

const getRunsByModelId = () => {
  const map = new Map<string, ModelEvaluationRun[]>()

  modelEvaluationRuns.forEach((run) => {
    const list = map.get(run.modelId)

    if (list) {
      list.push(run)
    } else {
      map.set(run.modelId, [run])
    }
  })

  map.forEach((runs) => {
    runs.sort((a, b) => b.startedAt.localeCompare(a.startedAt))
  })

  return map
}

const getStatsById = (runsByModelId: Map<string, ModelEvaluationRun[]>) => {
  return models.reduce<Record<string, ModelRunStats>>((acc, model) => {
    const runs = runsByModelId.get(model.id) ?? []
    const stats: ModelRunStats = {
      running: 0,
      completed: 0,
      failed: 0,
      queued: 0,
      total: runs.length,
      latestRunLabel: runs[0]?.startedAt ?? "No runs",
    }

    runs.forEach((run) => {
      stats[run.status] += 1
    })

    acc[model.id] = stats
    return acc
  }, {})
}

const formatAddedDate = (value: string) => {
  const parsed = new Date(`${value}T00:00:00`)

  if (Number.isNaN(parsed.getTime())) {
    return value
  }

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

const getBenchmarkRecords = (run: ModelEvaluationRun) => {
  return Array.from({ length: run.benchmarkCount }, (_, index) => {
    const benchmark = benchmarks[index % benchmarks.length]

    return {
      benchmark,
      status: run.status,
      progress: run.status === "running" ? run.progress : undefined,
    }
  })
}

const toEvaluationRecord = (
  model: Model,
  run: ModelEvaluationRun
): EvaluationRecord => {
  return {
    model,
    evalStatus: run.status,
    metadata: {
      start: run.startedAt,
      duration: run.duration,
      progress: run.progress,
    },
    benchmarkRecords: getBenchmarkRecords(run),
  }
}

export function Models() {
  const navigate = useNavigate()
  const runsByModelId = useMemo(() => getRunsByModelId(), [])
  const statsById = useMemo(() => getStatsById(runsByModelId), [runsByModelId])

  return (
    <div className="flex h-full w-full flex-col gap-6 p-4 text-white md:p-6">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold tracking-[0.28em] text-white/50 uppercase">
          Model registry
        </p>
        <h1 className="text-2xl font-semibold md:text-3xl">Models</h1>
      </div>

      <ModelCardGrid
        models={models}
        statsById={statsById}
        onSelectModel={(modelId) => navigate(`/models/${modelId}`)}
      />
    </div>
  )
}

export function ModelDetail() {
  const { modelId } = useParams()
  const navigate = useNavigate()
  const [isNewEvalOpen, setIsNewEvalOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [activeRun, setActiveRun] = useState<ModelEvaluationRun | null>(null)
  const model = models.find((item) => item.id === modelId) ?? null
  const runsByModelId = useMemo(() => getRunsByModelId(), [])
  const runs = model ? (runsByModelId.get(model.id) ?? []) : []
  const activeEvaluation = useMemo(() => {
    if (!model || !activeRun) {
      return null
    }

    return toEvaluationRecord(model, activeRun)
  }, [activeRun, model])

  if (!model) {
    return (
      <div className="flex h-full w-full flex-col gap-4 p-4 text-white md:p-6">
        <Button
          variant="outline"
          className="w-fit rounded-md"
          onClick={() => navigate("/models")}
        >
          <ArrowLeft className="size-4" />
          Models
        </Button>
        <Card className="rounded-lg border border-border/60 bg-[#151515] text-white">
          <CardContent className="py-10 text-sm text-white/60">
            This model could not be found.
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex h-full w-full flex-col gap-6 p-4 text-white md:p-6">
      <div className="flex flex-col gap-4">
        <Button
          variant="outline"
          className="w-fit rounded-md"
          onClick={() => navigate("/models")}
        >
          <ArrowLeft className="size-4" />
          Models
        </Button>

        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-white/10 bg-[#1b1b1b] text-sm font-semibold text-white">
                {model.symbol}
              </div>
              <div>
                <h1 className="text-2xl font-semibold md:text-3xl">
                  {model.name}
                </h1>
                <p className="mt-1 text-sm text-white/60">{model.id}</p>
              </div>
            </div>
            <p className="max-w-3xl text-sm leading-6 text-white/70">
              {model.description}
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="rounded-full px-2">
                Added {formatAddedDate(model.addedAt)}
              </Badge>
              <Badge variant="outline" className="rounded-full px-2">
                {runs.length} evaluations
              </Badge>
            </div>
          </div>

          <Button
            className="w-fit rounded-md"
            onClick={() => setIsNewEvalOpen(true)}
          >
            <CirclePlay className="size-4" />
            New Evaluation
          </Button>
        </div>
      </div>

      <ModelEvaluationPanel
        model={model}
        runs={runs}
        onSelectRun={(run) => {
          setActiveRun(run)
          setIsDetailsOpen(true)
        }}
      />

      <NewEvalModal isOpen={isNewEvalOpen} setIsOpen={setIsNewEvalOpen} />
      <CurrentEvalModal
        isOpen={isDetailsOpen}
        setIsOpen={setIsDetailsOpen}
        evaluation={activeEvaluation}
      />
    </div>
  )
}
