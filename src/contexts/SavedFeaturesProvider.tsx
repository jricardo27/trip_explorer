import React, { useState, useCallback, useEffect } from "react"

import { GeoJsonFeature } from "../data/types"
import idxFeat, { idxSel } from "../utils/idxFeat"

import SavedFeaturesContext, { DEFAULT_CATEGORY, SavedFeaturesContextType, SavedFeaturesStateType, selectionInfo } from "./SavedFeaturesContext"

/**
 * Props for the SavedFeaturesProvider.
 */
interface SavedFeaturesProviderProps {
  /** The child components that will have access to the saved features context. */
  children: React.ReactNode;
}

const STORAGE_KEY = "savedFeatures" // Note: This key is for an older structure, a more comprehensive reset would also consider CATEGORIES_KEY etc.

/**
 * Provides context for saved geographic features and their categories (implicitly, as categories are keys in SavedFeaturesStateType).
 *
 * This provider manages the state of user-saved features (POIs) using `useState`, `useEffect`,
 * and `useCallback` hooks to persist this data to the browser's local storage.
 *
 * It makes the current list of features, and functions for managing them
 * (adding, removing, updating, loading, saving), available to consuming components
 * via the `SavedFeaturesContext`.
 *
 * @param props - The properties for the provider.
 * @param props.children - The child components that will have access to this context.
 * @returns A SavedFeaturesContext.Provider component wrapping the children.
 */
const SavedFeaturesProvider: React.FC<SavedFeaturesProviderProps> = ({ children }) => {
  // Initial state setup
  const [savedFeatures, setSavedFeaturesState] = useState<SavedFeaturesStateType>(() => {
    const storedFeatures = localStorage.getItem(STORAGE_KEY) // This loads the entire state object including all categories
    return storedFeatures
      ? JSON.parse(storedFeatures)
      : {
          all: [],
        }
  })

  /**
   * Saves the current `savedFeatures` state to local storage.
   * This function is memoized to prevent unnecessary re-renders of consuming components.
   */
  const saveToLocalStorage = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedFeatures))
  }, [savedFeatures])

  /**
   * Loads the saved features state from local storage.
   * If data exists in local storage, it updates the component's state.
   * This function is memoized.
   */
  const loadFromLocalStorage = useCallback(() => {
    const storedFeatures = localStorage.getItem(STORAGE_KEY)
    if (storedFeatures) {
      setSavedFeaturesState(JSON.parse(storedFeatures))
    }
  }, []) // setSavedFeaturesState is stable, so no dependency needed

  // Effect to save features to local storage whenever they change
  useEffect(() => {
    saveToLocalStorage()
  }, [savedFeatures, saveToLocalStorage])

  /**
   * Sets the entire saved features state.
   * Accepts either a new state object or a function that receives the previous state
   * and returns the new state, similar to useState's setter.
   * This function is memoized.
   * @param arg - The new state or a function to update the state.
   */
  const setSavedFeatures = useCallback((arg: SavedFeaturesStateType | ((prev: SavedFeaturesStateType) => SavedFeaturesStateType)) => {
    if (typeof arg === "function") {
      setSavedFeaturesState((prevState: SavedFeaturesStateType) => arg(prevState))
    } else {
      setSavedFeaturesState(arg)
    }
  }, []) // setSavedFeaturesState is stable

  /**
   * Adds a feature to a specified category (listName).
   * If the feature is added to a category other than the DEFAULT_CATEGORY (e.g., "all"),
   * it is removed from the DEFAULT_CATEGORY to prevent duplication across distinct user categories
   * versus the general "all" list.
   * This function is memoized.
   * @param listName - The name of the category (list) to add the feature to.
   * @param feature - The GeoJsonFeature to add.
   */
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

  /**
   * Removes a feature from a specified category (listName) based on selection information.
   * The selection information is used to uniquely identify the feature to be removed.
   * This function is memoized.
   * @param listName - The name of the category (list) from which to remove the feature.
   * @param selection - An object containing information to identify the feature (e.g., ID or index).
   */
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

  /**
   * Updates an existing feature across all categories where it is found.
   * It identifies the feature to update based on its `id` property.
   * This function is memoized.
   * @param oldFeature - The original GeoJsonFeature object to be updated.
   * @param newFeature - The new GeoJsonFeature object that will replace the old one.
   */
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
