import { useMemo } from "react"
import { toast } from "sonner"
import { useEditModel } from "@/features/models/hooks/queries/useModels"

import { ModelForm } from "@/features/models/components/forms/ModelActionFormContent"

import type { LLMCreate, LLMRead } from "@/features/models/schemas/models"

export function EditModelForm({
  formId,
  model,
  onSubmitSuccess,
}: {
  formId: string
  model: LLMRead
  onSubmitSuccess: () => void
}) {
  const defaultValues = useMemo<LLMCreate>(
    () => ({
      name: model.name,
      endpoint: model.endpoint,
      api_key: model.api_key,
      description: model.description,
      provider: model.provider,
    }),
    [model]
  )

  const { mutate, isPending } = useEditModel({
    modelId: model.id,
  })

  function onSubmit(data: LLMCreate) {
    if (isPending) return

    mutate(data, {
      onSuccess: () => {
        toast.success("Model updated successfully!")
        onSubmitSuccess()
      },
      onError: (error) => {
        toast.error(`Failed to update model. Please try again. Error: ${error}`)
      },
    })
  }

  return (
    <ModelForm
      formId={formId}
      defaultValues={defaultValues}
      isSubmitting={isPending}
      onSubmit={onSubmit}
    />
  )
}
