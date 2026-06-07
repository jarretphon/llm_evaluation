import { NewEvalForm } from "@/components/NewEvalDialog/NewEvalForm"
import { ResponsiveDialog } from "@/components/ResponsiveDialog"
import { NEW_EVAL_DIALOG_TEXTS } from "@/components/NewEvalDialog/NewEvalDialog.texts"

export function NewEvalDialog({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
}) {
  return (
    <ResponsiveDialog
      dialogTexts={NEW_EVAL_DIALOG_TEXTS}
      isOpen={isOpen}
      setIsOpen={setIsOpen}
    >
      <NewEvalForm />
    </ResponsiveDialog>
  )
}
