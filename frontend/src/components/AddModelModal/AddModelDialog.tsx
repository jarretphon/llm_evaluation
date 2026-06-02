import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ADD_MODEL_MODAL_TEXTS } from "@/components/AddModelModal/AddModelModal.texts.ts"

export function AddModelDialog({
  isOpen,
  setIsOpen,
  children,
}: {
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  children: React.ReactNode
}) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <form>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{ADD_MODEL_MODAL_TEXTS.title}</DialogTitle>
            <DialogDescription>
              {ADD_MODEL_MODAL_TEXTS.description}
            </DialogDescription>
          </DialogHeader>
          {children}
          <DialogFooter>
            <DialogClose>
              <Button variant="outline">
                {ADD_MODEL_MODAL_TEXTS.secondaryAction}
              </Button>
            </DialogClose>
            <Button type="submit">{ADD_MODEL_MODAL_TEXTS.primaryAction}</Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  )
}
