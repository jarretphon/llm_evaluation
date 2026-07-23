import { SidebarInset, SidebarProvider } from "./components/ui/sidebar"
import { AppSidebar } from "@/components/Sidebar/Sidebar"
import { SiteHeader } from "@/components/site-header"

import { Route, Routes } from "react-router-dom"
import { Models } from "@/pages/models/models"
import { ModelDetails } from "@/pages/modelDetails/modelDetails"
import { Evaluations } from "@/pages/evaluations/evaluations"
import { Compare } from "@/pages/compare/compare"
import { Leaderboard } from "@/pages/leaderboard/leaderboard"
import { Toaster } from "@/components/ui/sonner"
import { useEvaluationEvents } from "@/features/evaluations/hooks/useEvaluationEvents"
import { usePrefetchBenchmarkOptions } from "@/hooks/queries/useBenchmarkOptions"

export function App() {
  useEvaluationEvents()
  usePrefetchBenchmarkOptions()

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
          <Route path="/" element={<Models />} />
          <Route path="/models/:modelId" element={<ModelDetails />} />
          <Route path="/evaluations" element={<Evaluations />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
        </Routes>
      </SidebarInset>

      <Toaster />
    </SidebarProvider>
  )
}

export default App
