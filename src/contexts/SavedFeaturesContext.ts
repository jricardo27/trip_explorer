import React from "react"

import { GeoJsonFeature } from "../data/types"

export type SavedFeaturesStateType = {
  [key: string]: GeoJsonFeature[]
}

export type SavedFeaturesContextType = {
  savedFeatures: SavedFeaturesStateType
  addFeature: (listName: string, feature: GeoJsonFeature) => void
  removeFeature: (listName: string, feature: GeoJsonFeature) => void
  updateFeature: (oldFeature: GeoJsonFeature, newFeature: GeoJsonFeature) => void
  setSavedFeatures: (newState: (prev: SavedFeaturesStateType) => { [p: string]: GeoJsonFeature[] }) => void
  saveToLocalStorage: () => void
  loadFromLocalStorage: () => void
}

const SavedFeaturesContext = React.createContext<SavedFeaturesContextType | undefined>(undefined)

export default SavedFeaturesContext
