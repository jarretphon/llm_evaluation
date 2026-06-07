import { useIsMobile } from "@/hooks/use-mobile"
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
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer"

interface ResponsiveDialogProps {
  dialogTexts: {
    title: string
    description: string
    primaryActionLabel: string
    secondaryActionLabel: string
  }
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  children: React.ReactNode
}

export function ResponsiveDialog({
  dialogTexts,
  isOpen,
  setIsOpen,
  children,
}: ResponsiveDialogProps) {
  const isMobile = useIsMobile()

  return isMobile ? (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{dialogTexts.title}</DrawerTitle>
          <DrawerDescription>{dialogTexts.description}</DrawerDescription>
        </DrawerHeader>
        {children}
        <DrawerFooter>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              {dialogTexts.secondaryActionLabel}
            </Button>
            <Button className="flex-1">{dialogTexts.primaryActionLabel}</Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ) : (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{dialogTexts.title}</DialogTitle>
          <DialogDescription>{dialogTexts.description}</DialogDescription>
        </DialogHeader>
        {children}
        <DialogFooter>
          <DialogClose>
            <Button variant="outline">
              {dialogTexts.secondaryActionLabel}
            </Button>
          </DialogClose>
          <Button type="submit">{dialogTexts.primaryActionLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
