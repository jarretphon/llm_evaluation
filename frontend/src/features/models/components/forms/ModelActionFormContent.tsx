import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"

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

import type { LLMCreate } from "@/features/models/schemas/models"
import { MODEL_TEXT } from "@/features/models/constants/texts"

const formSchema = z.object({
  name: z.string().min(1, "Please enter a name for the model."),
  endpoint: z.url({ message: "Please enter a valid URL (e.g., https://...)" }),
  api_key: z.string().min(1, "Please enter an API key."),
  description: z.string(),
  provider: z.string().min(1, "Please enter a provider."),
}) satisfies z.ZodType<LLMCreate>

type ModelFormValues = z.infer<typeof formSchema>

export function ModelForm({
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

  useEffect(() => {
    form.reset(defaultValues)
  }, [defaultValues, form])

  return (
    <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
      <fieldset disabled={form.formState.isSubmitting || isSubmitting}>
        <FieldGroup>
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>
                  {MODEL_TEXT.FORM.name.label}
                </FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  placeholder={MODEL_TEXT.FORM.name.placeholder}
                  autoComplete="off"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="endpoint"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>
                  {MODEL_TEXT.FORM.endpoint.label}
                </FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  placeholder={MODEL_TEXT.FORM.endpoint.placeholder}
                  autoComplete="off"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="api_key"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>
                  {MODEL_TEXT.FORM.apiKey.label}
                </FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  placeholder={MODEL_TEXT.FORM.apiKey.placeholder}
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
                <FieldLabel htmlFor={field.name}>
                  {MODEL_TEXT.FORM.description.label}
                </FieldLabel>
                <InputGroup>
                  <InputGroupTextarea
                    {...field}
                    id={field.name}
                    placeholder={MODEL_TEXT.FORM.description.placeholder}
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
                  {MODEL_TEXT.FORM.description.description}
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
