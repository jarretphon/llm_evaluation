import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
} from "@/components/ui/drawer"

export function CurrentEvalDrawer({
  isOpen,
  setIsOpen,
  children,
}: {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  children: React.ReactNode
}) {
  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerContent>
        {children}
        <DrawerFooter>
          <DrawerClose>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
