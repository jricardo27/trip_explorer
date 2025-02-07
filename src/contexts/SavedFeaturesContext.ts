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
  removeFeature: (listName: string, selection: selectionInfo) => void
  updateFeature: (oldFeature: GeoJsonFeature, newFeature: GeoJsonFeature) => void
  setSavedFeatures: (newState: (prev: SavedFeaturesStateType) => SavedFeaturesStateType) => void
  saveToLocalStorage: () => void
  loadFromLocalStorage: () => void
}

const SavedFeaturesContext = React.createContext<SavedFeaturesContextType | undefined>(undefined)

export default SavedFeaturesContext
