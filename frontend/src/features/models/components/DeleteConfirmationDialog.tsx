import { Trash2Icon } from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import { toast } from "sonner"
import { useDeleteModel } from "@/features/models/hooks/queries/useModels"
import type { LLMRead } from "../schemas/models"
import { MODEL_TEXT } from "@/features/models/constants/texts"

export function DeleteConfirmationDialog({
  model,
  isOpen,
  setIsOpen,
}: {
  model: LLMRead
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}) {
  const { mutate, isPending } = useDeleteModel()

  const handleDelete = () => {
    if (isPending) return

    mutate(model.id, {
      onSuccess: () => {
        toast.success(MODEL_TEXT.TOAST.deleteSuccess)
      },
      onError: (error) => {
        toast.error(MODEL_TEXT.TOAST.deleteError + " " + error.message)
      },
      onSettled: () => {
        setIsOpen(false)
      },
    })
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
            <Trash2Icon />
          </AlertDialogMedia>
          <AlertDialogTitle>
            {MODEL_TEXT.DELETE_CONFIRMATION_DIALOG.title}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {MODEL_TEXT.DELETE_CONFIRMATION_DIALOG.description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel variant="outline">
            {MODEL_TEXT.DELETE_CONFIRMATION_DIALOG.secondaryActionLabel}
          </AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={handleDelete}>
            {MODEL_TEXT.DELETE_CONFIRMATION_DIALOG.primaryActionLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
