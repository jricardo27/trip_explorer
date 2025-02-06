import { useCallback } from "react"

import { SavedFeaturesStateType } from "../../contexts/SavedFeaturesContext"
import { GeoJsonFeature } from "../../data/types"

interface UseFeatureManagement {
  handleRemoveFromList: () => void
  handleRemoveCompletely: () => void
}

interface UseFeatureManagementProps {
  setSavedFeatures: (newState: SavedFeaturesStateType) => void
  selectedTab: string
  contextMenuFeature: GeoJsonFeature | null
  removeFeature: (listName: string, feature: GeoJsonFeature | null) => void
}

export const useFeatureManagement = ({ setSavedFeatures, selectedTab, contextMenuFeature, removeFeature }: UseFeatureManagementProps): UseFeatureManagement => {
  const handleRemoveFromList = useCallback(() => {
    if (contextMenuFeature && selectedTab !== "all") {
      removeFeature(selectedTab, contextMenuFeature)
      setSavedFeatures((prev: SavedFeaturesStateType) => ({
        ...prev,
        all: [...prev.all, contextMenuFeature],
      }))
    }
  }, [contextMenuFeature, selectedTab, removeFeature, setSavedFeatures])

  const handleRemoveCompletely = useCallback(() => {
    if (contextMenuFeature) {
      removeFeature(selectedTab, contextMenuFeature)
      setSavedFeatures((prev: SavedFeaturesStateType) => ({
        ...prev,
        all: prev.all.filter((f) => f.properties?.id !== contextMenuFeature.properties?.id),
      }))
    }
  }, [contextMenuFeature, selectedTab, removeFeature, setSavedFeatures])

  return {
    handleRemoveFromList,
    handleRemoveCompletely,
  }
}
