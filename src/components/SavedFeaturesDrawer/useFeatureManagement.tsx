import { useCallback } from "react"

import { SavedFeaturesStateType, selectionInfo } from "../../contexts/SavedFeaturesContext"
import idxFeat, { idxSel } from "../../utils/idxFeat.ts"

interface UseFeatureManagement {
  handleRemoveFromList: () => void
  handleRemoveCompletely: () => void
}

export const useFeatureManagement = (
  setSavedFeatures: (newState: SavedFeaturesStateType) => void,
  selectedTab: string,
  contextMenuFeature: selectionInfo | null,
  removeFeature: (listName: string, selection: selectionInfo | null) => void,
): UseFeatureManagement => {
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
    handleRemoveFromList,
    handleRemoveCompletely,
  }
}
