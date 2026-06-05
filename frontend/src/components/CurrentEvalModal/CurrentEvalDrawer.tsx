import { Drawer, DrawerContent } from "@/components/ui/drawer"

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
      <DrawerContent>{children}</DrawerContent>
    </Drawer>
  )
}
