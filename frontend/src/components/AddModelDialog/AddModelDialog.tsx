import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogClose,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { modelService } from "@/services/models/user.service"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import type { components } from "@/types/schema"
type LLMCreate = components["schemas"]["LLMCreate"]
type LLMRead = components["schemas"]["LLMRead"]
type ModelFormValues = z.infer<typeof formSchema>

interface ModalProps {
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const ADD_MODEL_FORM_ID = "add-model-form"
const ADD_MODEL_DEFAULT_VALUES: ModelFormValues = {
  endpoint: "",
  description: "",
  provider: "Open AI",
}

export function AddModelModal({ isOpen, setIsOpen }: ModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Model</DialogTitle>
          <DialogDescription>
            Register a new model to the application. Evaluate and compare
            against other models.
          </DialogDescription>
        </DialogHeader>
        <AddModelForm
          formId={ADD_MODEL_FORM_ID}
          onSubmitSuccess={() => setIsOpen(false)}
        />
        <DialogFooter>
          <DialogClose>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="submit" form={ADD_MODEL_FORM_ID}>
            Add Model
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function EditModelModal({
  isOpen,
  setIsOpen,
  model,
}: ModalProps & { model: LLMRead }) {
  const formId = `edit-model-form-${model.id}`

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Model</DialogTitle>
          <DialogDescription>
            Update the model details used throughout evaluations and reports.
          </DialogDescription>
        </DialogHeader>
        <EditModelForm
          formId={formId}
          model={model}
          onSubmitSuccess={() => setIsOpen(false)}
        />
        <DialogFooter>
          <DialogClose>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="submit" form={formId}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const formSchema = z.object({
  endpoint: z.url({ message: "Please enter a valid URL (e.g., https://...)" }),
  description: z.string(),
  provider: z.string().min(1, "Please enter a provider."),
}) satisfies z.ZodType<LLMCreate>

export function AddModelForm({
  formId,
  onSubmitSuccess,
}: {
  formId: string
  onSubmitSuccess: () => void
}) {
  const [resetKey, setResetKey] = React.useState(0)
  const queryClient = useQueryClient()
  const { mutate, isPending } = useMutation({
    mutationFn: (data: ModelFormValues) => modelService.createModel(data),
    onSuccess: () => {
      toast.success("Model added successfully!")
      setResetKey((key) => key + 1)
      onSubmitSuccess()
      queryClient.invalidateQueries({ queryKey: ["models"] })
    },
    onError: (error) => {
      toast.error(`Failed to add model. Please try again. Error: ${error}`)
    },
  })

  function onSubmit(data: ModelFormValues) {
    if (isPending) return
    mutate(data)
  }

  return (
    <ModelForm
      key={resetKey}
      formId={formId}
      defaultValues={ADD_MODEL_DEFAULT_VALUES}
      isSubmitting={isPending}
      onSubmit={onSubmit}
    />
  )
}

export function EditModelForm({
  formId,
  model,
  onSubmitSuccess,
}: {
  formId: string
  model: LLMRead
  onSubmitSuccess: () => void
}) {
  const queryClient = useQueryClient()
  const defaultValues = React.useMemo<ModelFormValues>(
    () => ({
      endpoint: model.endpoint,
      description: model.description,
      provider: model.provider,
    }),
    [model.description, model.endpoint, model.provider]
  )

  const { mutate, isPending } = useMutation({
    mutationFn: (data: ModelFormValues) =>
      modelService.editModel(model.id, data),
    onSuccess: () => {
      toast.success("Model updated successfully!")
      queryClient.invalidateQueries({ queryKey: ["models"] })
      onSubmitSuccess()
    },
    onError: (error) => {
      toast.error(`Failed to update model. Please try again. Error: ${error}`)
    },
  })

  function onSubmit(data: ModelFormValues) {
    if (isPending) return
    mutate(data)
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

function ModelForm({
  formId,
  defaultValues,
  isSubmitting = false,
  onSubmit,
}: {
  formId: string
  defaultValues: ModelFormValues
  isSubmitting?: boolean
  onSubmit: (data: ModelFormValues) => void
}) {
  const form = useForm<ModelFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  React.useEffect(() => {
    form.reset(defaultValues)
  }, [defaultValues, form])

  return (
    <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
      <fieldset disabled={form.formState.isSubmitting || isSubmitting}>
        <FieldGroup>
          <Controller
            name="endpoint"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Model Endpoint</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  placeholder="e.g. https://model-endpoint.com/v1"
                  autoComplete="off"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="description"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                <InputGroup>
                  <InputGroupTextarea
                    {...field}
                    id={field.name}
                    placeholder="A simple text classification model."
                    rows={6}
                    className="min-h-24 resize-none"
                    aria-invalid={fieldState.invalid}
                  />
                  <InputGroupAddon align="block-end">
                    <InputGroupText className="tabular-nums">
                      {field.value.length} characters
                    </InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
                <FieldDescription>
                  Include details about the model endpoint.
                </FieldDescription>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>
      </fieldset>
    </form>
  )
}
