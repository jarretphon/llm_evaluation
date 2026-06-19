import { FolderCode } from "lucide-react"

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

import { MODEL_TEXT } from "@/features/models/constants/texts"

export function ModelGridEmpty() {
  return (
    <Empty className="border border-dashed bg-muted/30">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FolderCode />
        </EmptyMedia>
        <EmptyTitle>{MODEL_TEXT.EMPTY_STATE.title}</EmptyTitle>
        <EmptyDescription>
          {MODEL_TEXT.EMPTY_STATE.description}
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
