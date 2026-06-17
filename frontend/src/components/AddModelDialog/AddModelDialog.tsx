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

interface ModalProps {
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
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
        <AddModelForm onSubmitSuccess={() => setIsOpen(false)} />
        <DialogFooter>
          <DialogClose>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="submit" form="add-model-form">
            Add Model
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const formSchema = z.object({
  endpoint: z.url({ message: "Please enter a valid URL (e.g., https://...)" }),
  description: z.string(),
  provider: z.string(),
}) satisfies z.ZodType<LLMCreate>

export function AddModelForm({
  onSubmitSuccess,
}: {
  onSubmitSuccess: () => void
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      endpoint: "",
      description: "",
      provider: "Open AI",
    },
  })

  const queryClient = useQueryClient()
  const { mutate } = useMutation({
    mutationFn: (data: z.infer<typeof formSchema>) =>
      modelService.createModel(data),
    onSuccess: () => {
      toast.success("Model added successfully!")
      form.reset()
      onSubmitSuccess()
      queryClient.invalidateQueries({ queryKey: ["models"] })
    },
    onError: (error) => {
      toast.error(`Failed to add model. Please try again. Error: ${error}`)
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    mutate(data)
  }

  return (
    <form id="add-model-form" onSubmit={form.handleSubmit(onSubmit)}>
      <fieldset disabled={form.formState.isSubmitting}>
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
