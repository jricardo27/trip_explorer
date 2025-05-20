import React, { useMemo } from "react"
import { Box, CircularProgress, Typography } from "@mui/material"
import { FeatureMap } from "../../components/MapComponent/FeatureMap"
import styles from "../../components/PopupContent/PopupContent.module.css"
import { AUCKLAND_LOCATION } from "../../data/locations"
import { TTabMapping } from "../../data/types/TTabMapping"
import { usePoiSelection } from "../../contexts/PoiSelectionContext.ts"
import { usePoiBasedGeoJsonMarkers } from "../../hooks/usePoiBasedGeoJsonMarkers.ts"

interface NewZealandProps {
  drawerOpen: boolean
  closeDrawer: () => void
}

const allNewZealandOverlaySources: Record<string, TTabMapping> = {
  "/markers/newZealand/accommodation_campermate.json": {
    General: ["name", "fees", "bookable", { key: "description", className: styles.scrollableContent }],
    Score: ["score", "thumbs_up", "thumbs_down"],
  },
}

export const NewZealand = ({ drawerOpen, closeDrawer }: NewZealandProps): React.ReactNode => {
  const { selectedRegion, selectedCategories } = usePoiSelection()
  const { geoJsonDataMap, loading, error } = usePoiBasedGeoJsonMarkers()

  const activeOverlaySources = useMemo(() => {
    const loadedFilePaths = geoJsonDataMap ? Object.keys(geoJsonDataMap) : []
    if (selectedRegion !== "newZealand" || loadedFilePaths.length === 0) {
      return {}
    }
    const activeSources: Record<string, TTabMapping> = {}
    loadedFilePaths.forEach((path) => {
      if (allNewZealandOverlaySources[path]) {
        activeSources[path] = allNewZealandOverlaySources[path]
      } else {
        activeSources[path] = { General: ["name"] } // Fallback
        console.warn(`No specific tab mapping found for ${path} in NewZealand, using fallback.`)
      }
    })
    return activeSources
  }, [selectedRegion, geoJsonDataMap])

  if (selectedRegion !== "newZealand") {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="h6">Welcome to New Zealand</Typography>
        <Typography>
          To see points of interest, please select "newZealand" and desired categories in the Welcome Modal (File &gt; Select POIs & Categories).
        </Typography>
      </Box>
    )
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading POI data...</Typography>
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: "center", color: "error.main" }}>
        <Typography variant="h6">Error Loading POI Data</Typography>
        <Typography>{error.message || "An unknown error occurred."}</Typography>
      </Box>
    )
  }

  if (selectedCategories.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="h6">No Categories Selected for New Zealand</Typography>
        <Typography>
          Please select some categories in the Welcome Modal (File &gt; Select POIs & Categories) to display them on the map.
        </Typography>
        <FeatureMap center={AUCKLAND_LOCATION} geoJsonLayers={{}} geoJsonOverlaySources={{}} drawerOpen={drawerOpen} closeDrawer={closeDrawer} />
      </Box>
    )
  }

  return (
    <FeatureMap
      center={AUCKLAND_LOCATION}
      geoJsonLayers={geoJsonDataMap}
      geoJsonOverlaySources={activeOverlaySources}
      drawerOpen={drawerOpen}
      closeDrawer={closeDrawer}
    />
  )
}
