import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"

import { NEW_EVAL_MODAL_TEXTS } from "@/components/NewEvalModal/NewEvalModal.texts"

export function NewEvalDialog({
  isOpen,
  setIsOpen,
  handleSubmit,
  children,
}: {
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  handleSubmit: () => void
  children: React.ReactNode
}) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <form>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{NEW_EVAL_MODAL_TEXTS.title}</DialogTitle>
            <DialogDescription>
              {NEW_EVAL_MODAL_TEXTS.description}
            </DialogDescription>
          </DialogHeader>
          {children}
          <DialogFooter>
            <DialogClose>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="rounded-lg"
              >
                {NEW_EVAL_MODAL_TEXTS.secondaryAction}
              </Button>
            </DialogClose>
            <Button type="button" onClick={handleSubmit} className="rounded-lg">
              {NEW_EVAL_MODAL_TEXTS.primaryAction}
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  )
}
