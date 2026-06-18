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
import type { components } from "@/types/schema"

interface ModalProps {
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  model: components["schemas"]["LLMRead"]
}

export function EditModelModal({ isOpen, setIsOpen, model }: ModalProps) {
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
