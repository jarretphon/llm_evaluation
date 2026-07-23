import { Calendar } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card"

import { CardActionsDropdown } from "@/features/models/components/CardActionsDropdown"

import type { LLMRead } from "@/features/models/schemas/models"
import { useState } from "react"
import { EditModelModal } from "@/features/models/components/EditModelDialog"
import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog"

type ModelCardProps = {
  model: LLMRead
  onSelect: (modelId: string) => void
}

const formatAddedDate = (value: string) => {
  const parsed = new Date(`${value}T00:00:00Z`)

  if (Number.isNaN(parsed.getTime())) {
    return value
  }

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

const getProviderBadgeLabel = (provider: string) =>
  provider.trim().slice(0, 4).toUpperCase() || "LLM"

export function ModelCard({ model, onSelect }: ModelCardProps) {
  const [isEditModelDialogOpen, setIsEditModelDialogOpen] = useState(false)
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] =
    useState(false)
  const selectModel = () => onSelect(model.id)

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return
    }

    event.preventDefault()
    selectModel()
  }

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={selectModel}
        onKeyDown={handleKeyDown}
        className="group w-full text-left focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none"
      >
        <Card className="relative h-full gap-4 border border-border/50 bg-card text-card-foreground shadow-xl transition hover:border-primary/30 hover:bg-muted/40">
          <div className="flex justify-between gap-4 px-6">
            <div className="flex min-w-0 flex-1 items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-sm font-bold text-foreground">
                {getProviderBadgeLabel(model.provider)}
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="truncate text-base text-foreground">
                  {model.name}

                  <span className="text-muted-foreground">
                    {" - "} {model.endpoint}
                  </span>
                </CardTitle>
                <CardDescription className="line-clamp-2 text-xs leading-4 text-muted-foreground lg:line-clamp-3">
                  {model.description}
                </CardDescription>
              </div>
            </div>
            <div>
              <CardActionsDropdown
                onEdit={() => setIsEditModelDialogOpen(true)}
                onDelete={() => setIsDeleteConfirmationOpen(true)}
              />
            </div>
          </div>
          <CardContent className="space-y-3">
            <div className="flex flex-col gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="size-3.5" />
                Added {formatAddedDate(model.added_at)}
              </div>
              <div className="flex items-center gap-2 sm:col-span-2">
                <span className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground/70 uppercase">
                  Last run
                </span>
                <span>{"No runs yet"}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <EditModelModal
        isOpen={isEditModelDialogOpen}
        setIsOpen={setIsEditModelDialogOpen}
        model={model}
      />
      <DeleteConfirmationDialog
        model={model}
        isOpen={isDeleteConfirmationOpen}
        setIsOpen={setIsDeleteConfirmationOpen}
      />
    </>
  )
}
