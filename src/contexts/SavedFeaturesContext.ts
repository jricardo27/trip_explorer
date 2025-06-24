import React from "react"

import { GeoJsonFeature } from "../data/types"

export interface SavedFeaturesStateType {
  [key: string]: GeoJsonFeature[]
}

export interface selectionInfo {
  feature: GeoJsonFeature
  category: string
  index: number
}

export type setSavedFeaturesType = (newStateOrUpdater: SavedFeaturesStateType | ((prev: SavedFeaturesStateType) => SavedFeaturesStateType)) => void

export type SavedFeaturesContextType = {
  savedFeatures: SavedFeaturesStateType
  addFeature: (listName: string, feature: GeoJsonFeature) => void
  removeFeature: (listName: string, selection: selectionInfo | null) => void
  updateFeature: (oldFeature: GeoJsonFeature, newFeature: GeoJsonFeature) => void
  setSavedFeatures: setSavedFeaturesType
  saveToLocalStorage: () => void
  loadFromLocalStorage: () => void
  activeRouteGeoJson: GeoJSON.LineString | null // Added for active route
  setActiveRouteGeoJson: (route: GeoJSON.LineString | null) => void // Added for active route
}

export const DEFAULT_CATEGORY = "all"

const SavedFeaturesContext = React.createContext<SavedFeaturesContextType | undefined>(undefined)

export default SavedFeaturesContext
