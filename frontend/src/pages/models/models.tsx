import { useState } from "react"

import { ModelFilter } from "@/features/models/components/ModelFilter"
import { providers } from "@/data/providers"
import { ModelGrid } from "@/features/models/components/ModelGrid"
import { SectionCards } from "@/features/models/components/section-cards"

export function Models() {
  const [selectedProvider, setSelectedProvider] = useState("All")

  const providerOptions = providers

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-1 flex-col gap-2 px-4 pt-4 pb-1 md:gap-4 md:pt-6">
          <SectionCards />
          <ModelFilter
            providers={providerOptions}
            selectedProvider={selectedProvider}
            onProviderChange={setSelectedProvider}
          />
          <ModelGrid />
        </div>
      </div>
    </div>
  )
}
