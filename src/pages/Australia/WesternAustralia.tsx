import React, { useMemo } from "react"
import { Box, CircularProgress, Typography } from "@mui/material" // Added imports for loading/error/message states
import { FeatureMap } from "../../components/MapComponent/FeatureMap"
import styles from "../../components/PopupContent/PopupContent.module.css"
import { PERTH_LOCATION } from "../../data/locations"
import { TTabMapping } from "../../data/types/TTabMapping"
import { usePoiSelection } from "../../contexts/PoiSelectionContext.ts" // Added import
import { usePoiBasedGeoJsonMarkers } from "../../hooks/usePoiBasedGeoJsonMarkers.ts" // Added import

interface WesternAustraliaProps {
  drawerOpen: boolean
  closeDrawer: () => void
}

// This is the original hardcoded map of all possible sources and their tab configurations
const allWesternAustraliaOverlaySources: Record<string, TTabMapping> = {
  "/markers/westernAustralia/gas_stations_openstreetmap.json": {
    General: ["name", "brand", "operator", "opening_hours"],
  },
  "/markers/westernAustralia/gas_stations_fuelwatch.json": {
    General: ["name", "brandName", "manned", "operates247"],
  },
  "/markers/westernAustralia/gas_stations_bp.json": {
    General: ["name", "address", { key: "facilities", className: styles.scrollableContent }],
    "More Info": [{ key: "products", className: styles.scrollableContent }, "website", "telephone"],
  },
  "/markers/westernAustralia/national_parks_simplified.json": {
    General: ["name", "url", { key: "description", className: styles.scrollableContent }],
  },
  "/markers/westernAustralia/accommodation_WA.json": {
    General: ["name", "website", "tarif", "isBookable"],
    "More Info": ["operatorName", "GroupName", "CheckInTime", "CheckOutTime", "email", "address", "hours"],
  },
  "/markers/westernAustralia/accommodation_campermate.json": {
    General: ["name", "fees", "bookable", { key: "description", className: styles.scrollableContent }],
    Score: ["score", "thumbs_up", "thumbs_down"],
  },
  "/markers/westernAustralia/western_australia_tourism.json": {
    General: ["name", "url", { key: "description", className: styles.scrollableContent }],
  },
  "/markers/westernAustralia/western_australia_visitor_centre.json": {
    General: [
      "name", "type", { key: "description", className: styles.scrollableContent }, { key: "pointOfDifference", className: styles.scrollableContent },
    ],
    Info: ["address", "hours", "email", "website"],
  },
  "/markers/westernAustralia/big4_holiday_parks_WA.json": {
    General: ["name", "website", "reviews"],
  },
  "/markers/westernAustralia/discovery_parks_WA.json": {
    General: ["name", "area", "website", "reviews"],
  },
  "/markers/westernAustralia/toiletmap_aus_2025_WA.json": {
    General: ["Name", "Male", "Female", "Unisex", "Shower", "OpeningHours", "OpeningHoursNote", "Address1", "URL"],
  },
  "/markers/westernAustralia/places.json": {
    General: ["name"],
  },
}

export const WesternAustralia = ({ drawerOpen, closeDrawer }: WesternAustraliaProps): React.ReactNode => {
  const { selectedRegion, selectedCategories } = usePoiSelection()
  const {
    geoJsonDataMap,
    loading,
    error,
    // filePaths: loadedFilePaths, // No longer taken from hook
  } = usePoiBasedGeoJsonMarkers()

  const activeOverlaySources = useMemo(() => {
    // Derive loadedFilePaths from the keys of geoJsonDataMap
    const loadedFilePaths = geoJsonDataMap ? Object.keys(geoJsonDataMap) : []
    if (selectedRegion !== "westernAustralia" || loadedFilePaths.length === 0) {
      return {}
    }
    const activeSources: Record<string, TTabMapping> = {}
    loadedFilePaths.forEach((path) => {
      if (allWesternAustraliaOverlaySources[path]) {
        activeSources[path] = allWesternAustraliaOverlaySources[path]
      } else {
        // Fallback or generic mapping if a specific one isn't found
        // This case should ideally not happen if manifest.json is accurate and mappings are complete
        activeSources[path] = { General: ["name"] } // Example fallback
        console.warn(`No specific tab mapping found for ${path}, using fallback.`)
      }
    })
    return activeSources
  }, [selectedRegion, geoJsonDataMap])

  if (selectedRegion !== "westernAustralia") {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="h6">Welcome to Western Australia</Typography>
        <Typography>
          To see points of interest, please select "westernAustralia" and desired categories in the Welcome Modal (File &gt; Select POIs & Categories).
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
        <Typography variant="h6">No Categories Selected</Typography>
        <Typography>
          Please select some categories in the Welcome Modal (File &gt; Select POIs & Categories) to display them on the map.
        </Typography>
        <FeatureMap center={PERTH_LOCATION} geoJsonLayers={{}} geoJsonOverlaySources={{}} drawerOpen={drawerOpen} closeDrawer={closeDrawer} />
      </Box>
    )
  }

  return (
    <FeatureMap
      center={PERTH_LOCATION}
      geoJsonLayers={geoJsonDataMap} // Pass the loaded data
      geoJsonOverlaySources={activeOverlaySources} // Pass the filtered/active tab mappings
      drawerOpen={drawerOpen}
      closeDrawer={closeDrawer}
    />
  )
}
