import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

import { Link, useLocation } from "react-router-dom"
interface NavMainItem {
  title: string
  url: string
  icon?: React.ReactNode
}

export function NavMain({ items }: { items: NavMainItem[] }) {
  const { pathname } = useLocation()

  const isItemActive = (url: string) =>
    pathname === url || (url !== "/" && pathname.startsWith(`${url}/`))

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <Link to={item.url}>
                <SidebarMenuButton
                  isActive={isItemActive(item.url)}
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
