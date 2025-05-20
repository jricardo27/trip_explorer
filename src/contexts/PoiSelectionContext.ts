import { createContext, useContext } from "react"

export interface CategoryInfo {
  displayName: string
  fileName: string
}

export interface PoiSelectionContextType {
  selectedRegion: string
  setSelectedRegion: (region: string) => void
  selectedCategories: string[] // Stores raw filenames, e.g., "accommodation_WA.json"
  setSelectedCategories: (categories: string[]) => void
  availableCategories: CategoryInfo[] // Stores objects with displayName and fileName
  setAvailableCategories: (categories: CategoryInfo[]) => void
}

export const PoiSelectionContext = createContext<PoiSelectionContextType | undefined>(undefined)

export const usePoiSelection = () => {
  const context = useContext(PoiSelectionContext)
  if (!context) {
    throw new Error("usePoiSelection must be used within a PoiSelectionProvider")
  }
  return context
}
