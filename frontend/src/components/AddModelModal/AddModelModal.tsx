import { AddModelDialog } from "@/components/AddModelModal/AddModelDialog.tsx"
import { AddModelDrawer } from "@/components/AddModelModal/AddModelDrawer.tsx"
import { Field, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

import { useIsMobile } from "@/hooks/use-mobile.ts"
import { ADD_MODEL_MODAL_TEXTS } from "@/components/AddModelModal/AddModelModal.texts.ts"

interface ModalProps {
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export function AddModelModal({ isOpen, setIsOpen }: ModalProps) {
  const isMobile = useIsMobile()

  return isMobile ? (
    <AddModelDrawer isOpen={isOpen} setIsOpen={setIsOpen}>
      <ModelForm />
    </AddModelDrawer>
  ) : (
    <AddModelDialog isOpen={isOpen} setIsOpen={setIsOpen}>
      <ModelForm />
    </AddModelDialog>
  )
}

const ModelForm = () => {
  return (
    <FieldGroup className="px-2 sm:px-0">
      <Field>
        <Label htmlFor="model-endpoint">
          {ADD_MODEL_MODAL_TEXTS.formLabels.modelEndpoint}
        </Label>
        <Input
          id="model-endpoint"
          name="model-endpoint"
          placeholder="e.g. gpt-5.5"
        />
      </Field>
      <Field>
        <Label htmlFor="model-description">
          {ADD_MODEL_MODAL_TEXTS.formLabels.modelDescription}
        </Label>
        <Textarea
          id="model-description"
          name="model-description"
          placeholder="A simple text classification model."
        />
      </Field>
    </FieldGroup>
  )
}
