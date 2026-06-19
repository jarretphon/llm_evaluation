import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogClose,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

import { EditModelForm } from "@/features/models/components/forms/EditModelForm"

import type { LLMRead } from "@/features/models/schemas/models"
import { MODEL_TEXT } from "@/features/models/constants/texts"

interface ModalProps {
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  model: LLMRead
}

export function EditModelModal({ isOpen, setIsOpen, model }: ModalProps) {
  const formId = `edit-model-form-${model.id}`

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{MODEL_TEXT.EDIT_MODEL_DIALOG.title}</DialogTitle>
          <DialogDescription>
            {MODEL_TEXT.EDIT_MODEL_DIALOG.description}
          </DialogDescription>
        </DialogHeader>
        <EditModelForm
          formId={formId}
          model={model}
          onSubmitSuccess={() => setIsOpen(false)}
        />
        <DialogFooter>
          <DialogClose>
            <Button variant="outline">
              {MODEL_TEXT.EDIT_MODEL_DIALOG.secondaryActionLabel}
            </Button>
          </DialogClose>
          <Button type="submit" form={formId}>
            {MODEL_TEXT.EDIT_MODEL_DIALOG.primaryActionLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
