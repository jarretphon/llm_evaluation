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
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <SectionCards />
          <div className="flex h-full w-full flex-col gap-4 px-4 text-white md:px-6">
            <ModelFilter
              providers={providerOptions}
              selectedProvider={selectedProvider}
              onProviderChange={setSelectedProvider}
            />
            <ModelGrid />
          </div>
        </div>
      </div>
    </div>
  )
}
