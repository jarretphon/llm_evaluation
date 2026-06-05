import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerHeader,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer"
import { ScrollArea } from "@/components/ui/scroll-area"

import { NEW_EVAL_MODAL_TEXTS } from "@/components/NewEvalModal/NewEvalModal.texts"

export function NewEvalDrawer({
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
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerContent className="h-[80vh] overflow-hidden">
        <form className="flex min-h-0 flex-1 flex-col">
          <DrawerHeader>
            <DrawerTitle>{NEW_EVAL_MODAL_TEXTS.title}</DrawerTitle>
            <DrawerDescription>
              {NEW_EVAL_MODAL_TEXTS.description}
            </DrawerDescription>
          </DrawerHeader>
          <ScrollArea className="min-h-0 flex-1 px-4">{children}</ScrollArea>
          <DrawerFooter className="py-3">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="flex-1 rounded-lg"
              >
                {NEW_EVAL_MODAL_TEXTS.secondaryAction}
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                className="flex-1 rounded-lg"
              >
                {NEW_EVAL_MODAL_TEXTS.primaryAction}
              </Button>
            </div>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  )
}
