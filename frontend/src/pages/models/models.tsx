import { useState } from "react"

import { ModelFilter } from "@/features/models/components/ModelFilter"
import { providers } from "@/data/providers"
import { ModelGrid } from "@/features/models/components/ModelGrid"

export function Models() {
  const [selectedProvider, setSelectedProvider] = useState("All")

  const providerOptions = providers

  return (
    <div className="flex h-full w-full flex-col gap-4 p-4 text-white md:p-6">
      <ModelFilter
        providers={providerOptions}
        selectedProvider={selectedProvider}
        onProviderChange={setSelectedProvider}
      />
      <ModelGrid />
    </div>
  )
}
