import {
  CheckIcon,
  ChevronDownIcon,
  CirclePlusIcon,
  Search,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card } from "@/components/ui/card"
import { Item, ItemContent, ItemTitle } from "@/components/ui/item"
import { Input } from "@/components/ui/input"
import { AddModelModal } from "./AddModelModal/AddModelModal"
import { useState } from "react"

const SearchField = ({ placeholder }: { placeholder: string }) => {
  return (
    <div className="relative w-full min-w-0 flex-1 lg:w-full lg:max-w-xs">
      <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
      <Input
        placeholder={placeholder}
        className="h-10 w-full rounded-xl border-white/15 bg-[#202020] pl-9 text-sm text-white"
      />
    </div>
  )
}

type ItemDropdownProps = {
  data: string[]
  selectedValue: string
  onSelect: (value: string) => void
}

export function ItemDropdown({
  data,
  selectedValue,
  onSelect,
}: ItemDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            className="w-full cursor-pointer justify-between rounded-md lg:w-auto"
          >
            {selectedValue === "All" ? "All providers" : selectedValue}
            <ChevronDownIcon className="ml-auto" />
          </Button>
        }
      />
      <DropdownMenuContent className="w-48" align="end">
        <DropdownMenuGroup>
          {data.map((provider) => (
            <DropdownMenuItem
              key={provider}
              className="cursor-pointer"
              onClick={() => onSelect(provider)}
            >
              <Item size="xs" className="w-full p-2">
                <ItemContent className="gap-0">
                  <ItemTitle className="flex items-center justify-between gap-3">
                    <span>
                      {provider === "All" ? "All providers" : provider}
                    </span>
                    {selectedValue === provider && (
                      <CheckIcon className="size-4 text-zinc-300" />
                    )}
                  </ItemTitle>
                </ItemContent>
              </Item>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

type ModelFilterProps = {
  providers: string[]
  selectedProvider: string
  onProviderChange: (provider: string) => void
}

export function ModelFilter({
  providers,
  selectedProvider,
  onProviderChange,
}: ModelFilterProps) {
  const [isAddModelDialogOpen, setIsAddModelDialogOpen] = useState(false)

  return (
    <Card className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-0 rounded-xl border border-white/10 px-6 py-4 lg:grid-cols-[1fr_auto_auto]">
      <SearchField placeholder="Search models..." />

      <div className="col-span-2 mt-3 min-w-0 lg:col-span-1 lg:mt-0">
        <ItemDropdown
          data={providers}
          selectedValue={selectedProvider}
          onSelect={onProviderChange}
        />
      </div>

      <Button
        className="col-start-2 row-start-1 cursor-pointer rounded-md whitespace-nowrap lg:col-start-auto lg:row-start-auto lg:h-8"
        onClick={() => setIsAddModelDialogOpen(true)}
      >
        <CirclePlusIcon />
        <span className="ml-1 hidden sm:inline">New Model</span>
      </Button>

      <AddModelModal
        isOpen={isAddModelDialogOpen}
        setIsOpen={setIsAddModelDialogOpen}
      />
    </Card>
  )
}
