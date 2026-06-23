import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { SearchIcon, X } from "lucide-react"

export function SearchBar({
  value,
  onChange,
}: {
  value: string
  onChange: (query: string) => void
}) {
  return (
    <InputGroup className="w-full">
      <InputGroupInput
        placeholder="Search..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <InputGroupAddon>
        <SearchIcon />
      </InputGroupAddon>
      {value && (
        <InputGroupAddon align="inline-end">
          <InputGroupButton onClick={() => onChange("")} size="icon-xs">
            <X />
          </InputGroupButton>
        </InputGroupAddon>
      )}
    </InputGroup>
  )
}
