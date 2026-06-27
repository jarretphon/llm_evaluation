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
import { MODEL_TEXT } from "@/features/models/constants/texts"

interface ModalProps {
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const ADD_MODEL_FORM_ID = "add-model-form"

export function AddModelModal({ isOpen, setIsOpen }: ModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{MODEL_TEXT.ADD_MODEL_DIALOG.title}</DialogTitle>
          <DialogDescription>
            {MODEL_TEXT.ADD_MODEL_DIALOG.description}
          </DialogDescription>
        </DialogHeader>
        <AddModelForm
          formId={ADD_MODEL_FORM_ID}
          onSubmitSuccess={() => setIsOpen(false)}
        />
        <DialogFooter>
          <DialogClose>
            <Button variant="outline">
              {MODEL_TEXT.ADD_MODEL_DIALOG.secondaryActionLabel}
            </Button>
          </DialogClose>
          <Button type="submit" form={ADD_MODEL_FORM_ID}>
            {MODEL_TEXT.ADD_MODEL_DIALOG.primaryActionLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
