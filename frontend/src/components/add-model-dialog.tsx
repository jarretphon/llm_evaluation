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
import { Field, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer"

import { useIsMobile } from "@/hooks/use-mobile.ts"

const HeaderText = "Add New Model"
const DescriptionText =
  "Register a new model to the application. Evaluate and compare against other models."
const primaryActionText = "Add New Model"
const secondaryActionText = "Cancel"

const ModelEndpointInput = () => {
  return (
    <Field>
      <Label htmlFor="model-endpoint">Model Endpoint</Label>
      <Input
        id="model-endpoint"
        name="model-endpoint"
        placeholder="e.g. gpt-5.5"
      />
    </Field>
  )
}

const ModelDescriptionInput = () => {
  return (
    <Field>
      <Label htmlFor="model-description">Description</Label>
      <Textarea
        id="model-description"
        name="model-description"
        placeholder="A simple text classification model."
      />
    </Field>
  )
}

interface DialogProps {
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export function AddModelDialog({ isOpen, setIsOpen }: DialogProps) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <form>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>{HeaderText}</DrawerTitle>
              <DrawerDescription>{DescriptionText}</DrawerDescription>
            </DrawerHeader>
            <FieldGroup>
              <ModelEndpointInput />
              <ModelDescriptionInput />
            </FieldGroup>
            <DrawerFooter>
              <Button>{primaryActionText}</Button>
              <DrawerClose>
                <Button variant="outline">{secondaryActionText}</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </form>
      </Drawer>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <form>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{HeaderText}</DialogTitle>
            <DialogDescription>{DescriptionText}</DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <ModelEndpointInput />
            <ModelDescriptionInput />
          </FieldGroup>
          <DialogFooter>
            <DialogClose>
              <Button variant="outline">{secondaryActionText}</Button>
            </DialogClose>
            <Button type="submit">{primaryActionText}</Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  )
}
