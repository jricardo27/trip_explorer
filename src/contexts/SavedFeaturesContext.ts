import React from "react"

import { GeoJsonFeature } from "../data/types"

export type SavedFeaturesStateType = Record<string, GeoJsonFeature[]>

export interface selectionInfo {
  feature: GeoJsonFeature
  category: string
  index: number
}

export type SavedFeaturesContextType = {
  savedFeatures: SavedFeaturesStateType
  addFeature: (listName: string, feature: GeoJsonFeature) => void
  removeFeature: (listName: string, selection: selectionInfo | null) => void
  updateFeature: (oldFeature: GeoJsonFeature, newFeature: GeoJsonFeature) => void
  setSavedFeatures(newState: SavedFeaturesStateType): void
  setSavedFeatures(updater: (prev: SavedFeaturesStateType) => SavedFeaturesStateType): void
  saveToLocalStorage: () => void
  loadFromLocalStorage: () => void
}

export const DEFAULT_CATEGORY = "all"

const SavedFeaturesContext = React.createContext<SavedFeaturesContextType | undefined>(undefined)

export default SavedFeaturesContext
