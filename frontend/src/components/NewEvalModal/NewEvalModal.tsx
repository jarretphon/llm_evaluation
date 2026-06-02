import { NewEvalDialog } from "@/components/NewEvalModal/NewEvalDialog"
import { NewEvalDrawer } from "@/components/NewEvalModal/NewEvalDrawer"
import { NewEvalForm } from "@/components/NewEvalModal/NewEvalForm"
import { useIsMobile } from "@/hooks/use-mobile.ts"

export function NewEvalModal({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
}) {
  const handleSubmit = () => {
    setIsOpen(false)
  }

  const isMobile = useIsMobile()
  return isMobile ? (
    <NewEvalDrawer
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      handleSubmit={handleSubmit}
    >
      <NewEvalForm />
    </NewEvalDrawer>
  ) : (
    <NewEvalDialog
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      handleSubmit={handleSubmit}
    >
      <NewEvalForm />
    </NewEvalDialog>
  )
}
