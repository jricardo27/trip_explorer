import React, { useMemo } from "react"

import { FeatureMap } from "../../components/MapComponent/FeatureMap"
import styles from "../../components/PopupContent/PopupContent.module.css"
import { TTabMapping } from "../../data/types/TTabMapping.ts"

interface NewSouthWalesProps {
  drawerOpen: boolean
  closeDrawer: () => void
}

export const NewSouthWales = ({ drawerOpen, closeDrawer }: NewSouthWalesProps): React.ReactNode => {
  const SYDNEY_LOCATION = useMemo(() => ({ lat: -33.8688, lng: 151.2093 }), []) // Sydney coordinates

  const geoJsonOverlaySources = useMemo(
    (): Record<string, TTabMapping> => ({
      "/markers/newSouthWales/accommodation_NSW.json": {
        General: ["name", "website", "tarif", "isBookable"],
        "More Info": ["operatorName", "GroupName", "CheckInTime", "CheckOutTime", "email", "address", "hours"],
      },
      "/markers/newSouthWales/accommodation_campermate.json": {
        General: ["name", "fees", "bookable", { key: "description", className: styles.scrollableContent }],
        Score: ["score", "thumbs_up", "thumbs_down"],
      },
      "/markers/newSouthWales/toiletmap_aus_2025_NSW.json": {
        General: ["Name", "Male", "Female", "Unisex", "Shower", "OpeningHours", "OpeningHoursNote", "Address1", "URL"],
      },
      "/markers/newSouthWales/big4_holiday_parks_NSW.json": {
        General: ["name", "website", "reviews"],
      },
      "/markers/newSouthWales/discovery_parks_NSW.json": {
        General: ["name", "area", "website", "reviews"],
      },
    }),
    [],
  )

  return <FeatureMap center={SYDNEY_LOCATION} geoJsonOverlaySources={geoJsonOverlaySources} drawerOpen={drawerOpen} closeDrawer={closeDrawer} />
}
