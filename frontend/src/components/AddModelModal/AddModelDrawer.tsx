import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer"
import { ADD_MODEL_MODAL_TEXTS } from "@/components/AddModelModal/AddModelModal.texts.ts"

export function AddModelDrawer({
  isOpen,
  setIsOpen,
  children,
}: {
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  children: React.ReactNode
}) {
  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <form>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{ADD_MODEL_MODAL_TEXTS.title}</DrawerTitle>
            <DrawerDescription>
              {ADD_MODEL_MODAL_TEXTS.description}
            </DrawerDescription>
          </DrawerHeader>
          {children}
          <DrawerFooter>
            <Button>{ADD_MODEL_MODAL_TEXTS.primaryAction}</Button>
            <DrawerClose>
              <Button variant="outline">
                {ADD_MODEL_MODAL_TEXTS.secondaryAction}
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </form>
    </Drawer>
  )
}
