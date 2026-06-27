import { toast } from "sonner"
import { ModelForm } from "@/features/models/components/forms/ModelActionFormContent"
import { useCreateModel } from "@/features/models/hooks/queries/useModels"
import type { LLMCreate } from "@/features/models/schemas/models"

const ADD_MODEL_DEFAULT_VALUES: LLMCreate = {
  name: "",
  endpoint: "",
  description: "",
  api_key: "",
  provider: "Open AI",
}

export function AddModelForm({
  formId,
  onSubmitSuccess,
}: {
  formId: string
  onSubmitSuccess: () => void
}) {
  const { mutate, isPending } = useCreateModel()

  function onSubmit(data: LLMCreate) {
    if (isPending) return
    mutate(data, {
      onSuccess: () => {
        toast.success("Model added successfully!")
        onSubmitSuccess()
      },
      onError: (error) => {
        toast.error(`Failed to add model. Please try again. Error: ${error}`)
      },
    })
  }

  return (
    <ModelForm
      formId={formId}
      defaultValues={ADD_MODEL_DEFAULT_VALUES}
      isSubmitting={isPending}
      onSubmit={onSubmit}
    />
  )
}
