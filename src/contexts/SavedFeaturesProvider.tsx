import React, { useState, useCallback, useEffect } from "react"

import { GeoJsonFeature } from "../data/types"
import idxFeat, { idxSel } from "../utils/idxFeat"

import SavedFeaturesContext, { DEFAULT_CATEGORY, SavedFeaturesContextType, SavedFeaturesStateType, selectionInfo } from "./SavedFeaturesContext"

interface SavedFeaturesProviderProps {
  children: React.ReactNode
}

const STORAGE_KEY = "savedFeatures"

const SavedFeaturesProvider: React.FC<SavedFeaturesProviderProps> = ({ children }) => {
  // Initial state setup
  const [savedFeatures, setSavedFeaturesState] = useState<SavedFeaturesStateType>(() => {
    const storedFeatures = localStorage.getItem(STORAGE_KEY)
    return storedFeatures
      ? JSON.parse(storedFeatures)
      : {
          all: [],
        }
  })

  // Save to local storage
  const saveToLocalStorage = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedFeatures))
  }, [savedFeatures])

  // Load from local storage
  const loadFromLocalStorage = useCallback(() => {
    const storedFeatures = localStorage.getItem(STORAGE_KEY)
    if (storedFeatures) {
      setSavedFeaturesState(JSON.parse(storedFeatures))
    }
  }, [])

  // Effect to save features to local storage whenever they change
  useEffect(() => {
    saveToLocalStorage()
  }, [savedFeatures, saveToLocalStorage])

  const setSavedFeatures = useCallback((arg: SavedFeaturesStateType | ((prev: SavedFeaturesStateType) => SavedFeaturesStateType)) => {
    if (typeof arg === "function") {
      setSavedFeaturesState((prevState: SavedFeaturesStateType) => arg(prevState))
    } else {
      setSavedFeaturesState(arg)
    }
  }, [setSavedFeaturesState])

  // Function to add a feature to a specific list, but not to 'all' by default
  const addFeature = useCallback((listName: string, feature: GeoJsonFeature) => {
    if (!feature) return

    setSavedFeatures((prevFeatures: SavedFeaturesStateType) => {
      const newList = [...(prevFeatures[listName] || []), feature]

      if (listName === DEFAULT_CATEGORY) {
        return {
          ...prevFeatures,
          [listName]: newList,
        }
      } else {
        return {
          ...prevFeatures,
          [listName]: newList,
          // Remove feature from 'all' if it exists there, ensuring it's not in both
          [DEFAULT_CATEGORY]: prevFeatures[DEFAULT_CATEGORY].filter((f) => f.properties?.id !== feature.properties?.id),
        }
      }
    })
  }, [setSavedFeatures])

  // Function to remove a feature from a specific list
  const removeFeature = useCallback((listName: string, selection: selectionInfo | null) => {
    if (!selection) {
      console.error("No selection info when trying to remove feature")
      return
    }

    setSavedFeatures((prevFeatures: SavedFeaturesStateType) => {
      const newList = (prevFeatures[listName] || []).filter((f, index) => idxFeat(index, f) !== idxSel(selection))
      return {
        ...prevFeatures,
        [listName]: newList,
      }
    })
  }, [setSavedFeatures])

  // Function to update a feature in all lists where it exists
  const updateFeature = useCallback((oldFeature: GeoJsonFeature, newFeature: GeoJsonFeature) => {
    setSavedFeatures((prevFeatures: SavedFeaturesStateType): SavedFeaturesStateType => {
      const newFeatures = { ...prevFeatures }
      for (const key in newFeatures) {
        newFeatures[key] = newFeatures[key].map((item) =>
          item.properties?.id === oldFeature.properties?.id ? newFeature : item,
        )
      }
      return newFeatures
    })
  }, [setSavedFeatures])

  const contextValue: SavedFeaturesContextType = {
    savedFeatures,
    addFeature,
    removeFeature,
    updateFeature,
    setSavedFeatures,
    saveToLocalStorage,
    loadFromLocalStorage,
  }

  return (
    <SavedFeaturesContext.Provider value={contextValue}>
      {children}
    </SavedFeaturesContext.Provider>
  )
}

export default SavedFeaturesProvider
