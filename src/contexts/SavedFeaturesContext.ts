import React from "react"

import { GeoJsonFeature } from "../data/types"

export type SavedFeaturesState = {
  [key: string]: GeoJsonFeature[]
}

export type SavedFeaturesContextType = {
  savedFeatures: SavedFeaturesState
  addFeature: (listName: string, feature: GeoJsonFeature) => void
  removeFeature: (listName: string, feature: GeoJsonFeature) => void
  updateFeature: (oldFeature: GeoJsonFeature, newFeature: GeoJsonFeature) => void
  saveToLocalStorage: () => void
  loadFromLocalStorage: () => void
}

const SavedFeaturesContext = React.createContext<SavedFeaturesContextType | undefined>(undefined)

export default SavedFeaturesContext
