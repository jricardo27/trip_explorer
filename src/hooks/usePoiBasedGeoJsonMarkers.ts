import { useMemo } from "react"
import { usePoiSelection } from "../contexts/PoiSelectionContext.ts"
import { useGeoJsonMarkers, GeoJsonDataMap } from "./useGeoJsonMarkers.ts" // Assuming this is the correct path and GeoJsonDataMap type is exported

interface UsePoiBasedGeoJsonMarkersReturn {
  geoJsonDataMap: GeoJsonDataMap | null // Can be null if no files or error
  loading: boolean
  error: Error | null
}

export const usePoiBasedGeoJsonMarkers = (): UsePoiBasedGeoJsonMarkersReturn => {
  const { selectedRegion, selectedCategories } = usePoiSelection()

  const geoJsonFiles = useMemo(() => {
    if (!selectedRegion || selectedCategories.length === 0) {
      return []
    }
    // selectedCategories already stores raw filenames, e.g., "accommodation_WA.json"
    return selectedCategories.map(
      (categoryFileName) => `/markers/${selectedRegion}/${categoryFileName}`,
    )
  }, [selectedRegion, selectedCategories])

  // Call the original hook
  const { geoJsonDataMap, loading, error } = useGeoJsonMarkers(geoJsonFiles)

  return { geoJsonDataMap, loading, error }
}
