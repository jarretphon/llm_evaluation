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

import { AddModelForm } from "@/features/models/components/forms/AddModelForm"

interface ModalProps {
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const ADD_MODEL_FORM_ID = "add-model-form"

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
