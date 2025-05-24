import React from "react"

import { GeoJsonFeature } from "../data/types"
import { LineDefinition } from "../utils/idbUtils" // Added

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
  // Existing feature-related properties (now implicitly for the current project)
  savedFeatures: SavedFeaturesStateType
  addFeature: (listName: string, feature: GeoJsonFeature) => void
  removeFeature: (listName: string, selection: selectionInfo | null) => void
  updateFeature: (oldFeature: GeoJsonFeature, newFeature: GeoJsonFeature) => void
  setSavedFeatures: setSavedFeaturesType // Used to load data into the current project

  // Functions to manage persistence of all projects' data
  saveToLocalStorage: () => void // Saves all projects and management state
  loadFromLocalStorage: () => void // Loads all projects and management state

  // New project management properties
  currentProjectName: string
  projectNames: string[]
  setCurrentProjectName: (projectName: string) => void
  createNewProject: (projectName: string) => void

  // Line / Route management properties
  currentProjectLines: LineDefinition[]
  addNewLine: (name: string, poiIds: string[]) => Promise<void>
  updateExistingLine: (line: LineDefinition) => Promise<void>
  deleteExistingLine: (lineId: string) => Promise<void>
}

export const DEFAULT_CATEGORY = "all" // This constant is used for the default category within a project

const SavedFeaturesContext = React.createContext<SavedFeaturesContextType | undefined>(undefined)

export default SavedFeaturesContext
