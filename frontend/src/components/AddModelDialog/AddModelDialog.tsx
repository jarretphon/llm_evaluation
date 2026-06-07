import { Field, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

import { ResponsiveDialog } from "@/components/ResponsiveDialog"
import {
  ADD_MODEL_MODAL_TEXTS,
  formLabels,
} from "@/components/AddModelDialog/AddModelDialog.texts"

interface ModalProps {
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export function AddModelModal({ isOpen, setIsOpen }: ModalProps) {
  return (
    <ResponsiveDialog
      dialogTexts={ADD_MODEL_MODAL_TEXTS}
      isOpen={isOpen}
      setIsOpen={setIsOpen}
    >
      <ModelForm />
    </ResponsiveDialog>
  )
}

const ModelForm = () => {
  return (
    <form>
      <FieldGroup className="px-2 sm:px-0">
        <Field>
          <Label htmlFor="model-endpoint">{formLabels.modelEndpoint}</Label>
          <Input
            id="model-endpoint"
            name="model-endpoint"
            placeholder="e.g. gpt-5.5"
          />
        </Field>
        <Field>
          <Label htmlFor="model-description">
            {formLabels.modelDescription}
          </Label>
          <Textarea
            id="model-description"
            name="model-description"
            placeholder="A simple text classification model."
          />
        </Field>
      </FieldGroup>
    </form>
  )
}
