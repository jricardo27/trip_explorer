import { createContext, useContext } from "react"

export interface CategoryInfo {
  displayName: string
  fileName: string
}

export interface RegionInfo {
  id: string
  name: string
}

export interface PoiSelectionContextType {
  selectedRegion: string
  setSelectedRegion: (region: string) => void
  selectedCategories: string[] // Stores raw filenames, e.g., "accommodation_WA.json"
  setSelectedCategories: (categories: string[]) => void
  availableCategories: CategoryInfo[] // Stores objects with displayName and fileName
  setAvailableCategories: (categories: CategoryInfo[]) => void
  regions: RegionInfo[] // Added to hold the list of all available regions
}

export const PoiSelectionContext = createContext<PoiSelectionContextType | undefined>(undefined) // Initializing regions as empty array will be handled by provider

export const usePoiSelection = () => {
  const context = useContext(PoiSelectionContext)
  if (!context) {
    throw new Error("usePoiSelection must be used within a PoiSelectionProvider")
  }
  return context
}
