import { SidebarInset, SidebarProvider } from "./components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"

import { Route, Routes } from "react-router-dom"
import { Dashboard } from "@/pages/dashboard"
import { ModelDetail, Models } from "@/pages/models"
import { Evaluations } from "@/pages/evaluations"
import { Compare } from "@/pages/compare"
import { Leaderboard } from "@/pages/leaderboard"

export function App() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="floating" collapsible="icon" />
      <SidebarInset>
        <SiteHeader />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/models" element={<Models />} />
          <Route path="/models/:modelId" element={<ModelDetail />} />
          <Route path="/evaluations" element={<Evaluations />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
        </Routes>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default App
