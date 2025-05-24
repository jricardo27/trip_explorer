import React, { useMemo } from "react"

import { FeatureMap } from "../../components/MapComponent/FeatureMap"
import styles from "../../components/PopupContent/PopupContent.module.css"
import { HOBART_LOCATION } from "../../data/locations"
import { TCurrentSearchResult, TTabMapping } from "../../data/types" // Updated TCoordinate to TCurrentSearchResult

interface TasmaniaProps {
  drawerOpen: boolean
  closeDrawer: () => void
  currentSearchResult: TCurrentSearchResult // Updated type
}

export const Tasmania = ({ drawerOpen, closeDrawer, currentSearchResult }: TasmaniaProps): React.ReactNode => {
  const geoJsonOverlaySources = useMemo(
    (): Record<string, TTabMapping> => ({
      "/markers/tasmania/accommodation_TAS.json": {
        General: ["name", "website", "tarif", "isBookable"],
        "More Info": ["operatorName", "GroupName", "CheckInTime", "CheckOutTime", "email", "address", "hours"],
      },
      "/markers/tasmania/accommodation_campermate.json": {
        General: ["name", "fees", "bookable", { key: "description", className: styles.scrollableContent }],
        Score: ["score", "thumbs_up", "thumbs_down"],
      },
      "/markers/tasmania/toiletmap_aus_2025_TAS.json": {
        General: ["Name", "Male", "Female", "Unisex", "Shower", "OpeningHours", "OpeningHoursNote", "Address1", "URL"],
      },
      "/markers/tasmania/big4_holiday_parks_TAS.json": {
        General: ["name", "website", "reviews"],
      },
      "/markers/tasmania/discovery_parks_TAS.json": {
        General: ["name", "area", "website", "reviews"],
      },
    }), [])

  return <FeatureMap center={HOBART_LOCATION} geoJsonOverlaySources={geoJsonOverlaySources} drawerOpen={drawerOpen} closeDrawer={closeDrawer} currentSearchResult={currentSearchResult} />
}
