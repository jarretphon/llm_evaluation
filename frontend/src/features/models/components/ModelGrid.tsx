import { ModelCard } from "@/features/models/components/ModelCard"
import { useGetModels } from "@/features/models/hooks/queries/useModels"
import { ModelGridEmpty } from "@/features/models/components/ModelGridEmpty"
import { useNavigate } from "react-router-dom"

export function ModelGrid() {
  const navigate = useNavigate()
  const { data, isPending, error } = useGetModels()

  if (isPending) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-white/80" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-white/10 bg-[#181818] px-6 py-10 text-center text-sm text-red-500">
        Failed to load models: {error.message}
      </div>
    )
  }

  if (!data || data.length === 0) {
    return <ModelGridEmpty />
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
      {data.map((model) => (
        <ModelCard
          key={model.id}
          model={model}
          onSelect={(modelId) => navigate(`/models/${modelId}`)}
        />
      ))}
    </div>
  )
}
