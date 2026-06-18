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

const formSchema = z.object({
  endpoint: z.url({ message: "Please enter a valid URL (e.g., https://...)" }),
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
