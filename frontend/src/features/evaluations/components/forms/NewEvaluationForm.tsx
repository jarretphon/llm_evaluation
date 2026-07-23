import { BenchmarkSelectionTree } from "@/features/evaluations/components/BenchmarkSelectionTree"
import { useCreateEvaluation } from "@/features/evaluations/hooks/queries/useEvaluations"
import type { EvaluationCreate } from "@/features/evaluations/schemas/evaluations"
import type { BenchmarkTask } from "@/features/evaluations/utils/benchmarkSelection"
import type { components } from "@/types/schema"
import { toast } from "sonner"

type Model = components["schemas"]["LLMRead"]

const DEFAULT_EVALUATION_MODEL_NAME = "default"

export function NewEvaluationForm({
  formId,
  model,
  benchmarks,
  selectedItems,
  setSelectedItems,
  onSubmitSuccess,
}: {
  formId: string
  model: Model
  benchmarks: BenchmarkTask[]
  selectedItems: Set<string>
  setSelectedItems: React.Dispatch<React.SetStateAction<Set<string>>>
  onSubmitSuccess: () => void
}) {
  const { mutate: createEvaluation, isPending } = useCreateEvaluation()

  const selectedBenchmarkNames = Array.from(selectedItems)

  const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (isPending) {
      return
    }

    if (selectedBenchmarkNames.length === 0) {
      toast.error("Select at least one benchmark to start an evaluation.")
      return
    }

    const evaluationCreate: EvaluationCreate = {
      model_id: model.id,
      model_endpoint: model.endpoint,
      model_name: DEFAULT_EVALUATION_MODEL_NAME,
      benchmarks: selectedBenchmarkNames,
    }

    createEvaluation(evaluationCreate, {
      onSuccess: () => {
        toast.success("Evaluation queued.")
        onSubmitSuccess()
      },
      onError: (error) => {
        toast.error(`Failed to register evaluation. Error: ${error}`)
      },
    })
  }

  return (
    <form id={formId} onSubmit={handleSubmit}>
      <fieldset disabled={isPending}>
        <BenchmarkSelectionTree
          benchmarks={benchmarks}
          selectedItems={selectedItems}
          setSelectedItems={setSelectedItems}
        />
      </fieldset>
    </form>
  )
}
