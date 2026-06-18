import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { EllipsisVertical, PencilIcon, TrashIcon } from "lucide-react"

import type { LLMRead } from "@/features/models/schemas/models"

import { useDeleteModel } from "@/features/models/hooks/queries/useModels"
import { toast } from "sonner"

export function CardActionsDropdown({
  model,
  onEdit,
}: {
  model: LLMRead
  onEdit: () => void
}) {
  const { mutate, isPending } = useDeleteModel()

  const handleDelete = () => {
    if (isPending) return
    mutate(model.id, {
      onSuccess: () => {
        toast.success("Model deleted successfully!")
      },
      onError: (error) => {
        toast.error(`Failed to delete model. Please try again. Error: ${error}`)
      },
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="inline-flex size-9 cursor-pointer items-center justify-center rounded-full transition hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
        onPointerDown={(event) => event.stopPropagation()}
      >
        <EllipsisVertical className="size-5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent onClick={(event) => event.stopPropagation()}>
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={onEdit}>
            <PencilIcon />
            Edit
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem variant="destructive" onClick={handleDelete}>
            <TrashIcon />
            Delete
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
