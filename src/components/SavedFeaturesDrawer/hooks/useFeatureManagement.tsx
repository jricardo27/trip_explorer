import { useCallback } from "react"

import { SavedFeaturesStateType, selectionInfo } from "../../../contexts/SavedFeaturesContext"
import idxFeat, { idxSel } from "../../../utils/idxFeat"

interface UseFeatureManagement {
  handleDuplicate: () => void
  handleRemoveFromList: () => void
  handleRemoveCompletely: () => void
}

export const useFeatureManagement = (
  setSavedFeatures: {
    (newState: SavedFeaturesStateType): void
    (updater: (prev: SavedFeaturesStateType) => SavedFeaturesStateType): void
  },
  selectedTab: string,
  contextMenuFeature: selectionInfo | null,
  removeFeature: (listName: string, selection: selectionInfo | null) => void,
): UseFeatureManagement => {
  const handleDuplicate = useCallback(() => {
    if (contextMenuFeature) {
      setSavedFeatures((prev: SavedFeaturesStateType) => ({
        ...prev,
        [selectedTab]: [...prev[selectedTab], contextMenuFeature.feature],
      }))
    }
  }, [contextMenuFeature, selectedTab, setSavedFeatures])

  const handleRemoveFromList = useCallback(() => {
    if (contextMenuFeature && selectedTab !== "all") {
      removeFeature(selectedTab, contextMenuFeature)
      setSavedFeatures((prev: SavedFeaturesStateType) => ({
        ...prev,
        all: [...prev.all, contextMenuFeature.feature],
      }))
    }
  }, [contextMenuFeature, selectedTab, removeFeature, setSavedFeatures])

  const handleRemoveCompletely = useCallback(() => {
    if (contextMenuFeature) {
      removeFeature(selectedTab, contextMenuFeature)
      setSavedFeatures((prev: SavedFeaturesStateType) => ({
        ...prev,
        all: prev.all.filter((f, index) => idxFeat(index, f) !== idxSel(contextMenuFeature)),
      }))
    }
  }, [contextMenuFeature, selectedTab, removeFeature, setSavedFeatures])

  return {
    handleDuplicate,
    handleRemoveFromList,
    handleRemoveCompletely,
  }
}
