import { models } from "@/data/models"

export const providers = [
  "All",
  ...Array.from(new Set(models.map((model) => model.provider))),
]
