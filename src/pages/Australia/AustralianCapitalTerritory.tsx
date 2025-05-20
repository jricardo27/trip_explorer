import React, { useMemo } from "react"
import { Box, CircularProgress, Typography } from "@mui/material"
import { FeatureMap } from "../../components/MapComponent/FeatureMap"
import styles from "../../components/PopupContent/PopupContent.module.css"
import { CANBERRA_LOCATION } from "../../data/locations"
import { TTabMapping } from "../../data/types/TTabMapping"
import { usePoiSelection } from "../../contexts/PoiSelectionContext.ts"
import { usePoiBasedGeoJsonMarkers } from "../../hooks/usePoiBasedGeoJsonMarkers.ts"

interface AustralianCapitalTerritoryProps {
  drawerOpen: boolean
  closeDrawer: () => void
}

const allAustralianCapitalTerritoryOverlaySources: Record<string, TTabMapping> = {
  "/markers/australianCapitalTerritory/accommodation_ACT.json": {
    General: ["name", "website", "tarif", "isBookable"],
    "More Info": ["operatorName", "GroupName", "CheckInTime", "CheckOutTime", "email", "address", "hours"],
  },
  "/markers/australianCapitalTerritory/accommodation_campermate.json": {
    General: ["name", "fees", "bookable", { key: "description", className: styles.scrollableContent }],
    Score: ["score", "thumbs_up", "thumbs_down"],
  },
  "/markers/australianCapitalTerritory/toiletmap_aus_2025_ACT.json": {
    General: ["Name", "Male", "Female", "Unisex", "Shower", "OpeningHours", "OpeningHoursNote", "Address1", "URL"],
  },
}

export const AustralianCapitalTerritory = ({ drawerOpen, closeDrawer }: AustralianCapitalTerritoryProps): React.ReactNode => {
  const { selectedRegion, selectedCategories } = usePoiSelection()
  const { geoJsonDataMap, loading, error } = usePoiBasedGeoJsonMarkers()

  const activeOverlaySources = useMemo(() => {
    const loadedFilePaths = geoJsonDataMap ? Object.keys(geoJsonDataMap) : []
    if (selectedRegion !== "australianCapitalTerritory" || loadedFilePaths.length === 0) {
      return {}
    }
    const activeSources: Record<string, TTabMapping> = {}
    loadedFilePaths.forEach((path) => {
      if (allAustralianCapitalTerritoryOverlaySources[path]) {
        activeSources[path] = allAustralianCapitalTerritoryOverlaySources[path]
      } else {
        activeSources[path] = { General: ["name"] } // Fallback
        console.warn(`No specific tab mapping found for ${path} in AustralianCapitalTerritory, using fallback.`)
      }
    })
    return activeSources
  }, [selectedRegion, geoJsonDataMap])

  if (selectedRegion !== "australianCapitalTerritory") {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="h6">Welcome to Australian Capital Territory</Typography>
        <Typography>
          To see points of interest, please select "australianCapitalTerritory" and desired categories in the Welcome Modal (File &gt; Select POIs & Categories).
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
        <Typography variant="h6">No Categories Selected for Australian Capital Territory</Typography>
        <Typography>
          Please select some categories in the Welcome Modal (File &gt; Select POIs & Categories) to display them on the map.
        </Typography>
        <FeatureMap center={CANBERRA_LOCATION} geoJsonLayers={{}} geoJsonOverlaySources={{}} drawerOpen={drawerOpen} closeDrawer={closeDrawer} />
      </Box>
    )
  }

  return (
    <FeatureMap
      center={CANBERRA_LOCATION}
      geoJsonLayers={geoJsonDataMap}
      geoJsonOverlaySources={activeOverlaySources}
      drawerOpen={drawerOpen}
      closeDrawer={closeDrawer}
    />
  )
}
