import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { CirclePlusIcon } from "lucide-react"

import { Link } from "react-router-dom"

import { useState } from "react"
import { AddModelDialog } from "./add-model-dialog"
interface NavMainItem {
  title: string
  url: string
  icon?: React.ReactNode
}

export function NavMain({ items }: { items: NavMainItem[] }) {
  const [active, setActive] = useState(items[0].url)
  const [isAddModelDialogOpen, setIsAddModelDialogOpen] = useState(false)

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              tooltip="New model"
              className="min-w-8 cursor-pointer bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
              onClick={() => setIsAddModelDialogOpen(true)}
            >
              <CirclePlusIcon />
              <span>New Model</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <AddModelDialog
          isOpen={isAddModelDialogOpen}
          setIsOpen={setIsAddModelDialogOpen}
        />

        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <Link to={item.url}>
                <SidebarMenuButton
                  isActive={active === item.url}
                  onClick={() => setActive(item.url)}
                  tooltip={item.title}
                  className="cursor-pointer"
                >
                  {item.icon}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
