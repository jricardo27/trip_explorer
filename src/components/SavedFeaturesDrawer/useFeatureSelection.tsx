import { useCallback, useState } from "react"

import { GeoJsonFeature } from "../../data/types"

interface UseFeatureSelection {
  selectedFeature: GeoJsonFeature | null
  setSelectedFeature: (feature: GeoJsonFeature | null) => void
}

export const useFeatureSelection = (): UseFeatureSelection => {
  const [selectedFeature, setSelectedFeature] = useState<GeoJsonFeature | null>(null)

  const setSelectedFeatureCallback = useCallback((feature: GeoJsonFeature | null) => {
    setSelectedFeature((prev) => prev === feature ? null : feature)
  }, [])

  return {
    selectedFeature,
    setSelectedFeature: setSelectedFeatureCallback,
  }
}
