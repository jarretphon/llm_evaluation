import { Dialog, DialogContent } from "@/components/ui/dialog"

export function CurrentEvalDialog({
  isOpen,
  setIsOpen,
  children,
}: {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  children: React.ReactNode
}) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-3xl">{children}</DialogContent>
    </Dialog>
  )
}
