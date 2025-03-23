import React, { useMemo } from "react"

import { FeatureMap } from "../../components/MapComponent/FeatureMap"
import styles from "../../components/PopupContent/PopupContent.module.css"
import { PERTH_LOCATION } from "../../data/locations"
import { TTabMapping } from "../../data/types/TTabMapping"
import { useMapState } from "../../hooks/useMapState"

interface WesternAustraliaProps {
  drawerOpen: boolean
  closeDrawer: () => void
}

export const WesternAustralia = ({ drawerOpen, closeDrawer }: WesternAustraliaProps): React.ReactNode => {
  useMapState({ capitalCity: PERTH_LOCATION })

  const geoJsonOverlaySources = useMemo(
    (): Record<string, TTabMapping> => ({
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
    }), [])

  return <FeatureMap center={PERTH_LOCATION} geoJsonOverlaySources={geoJsonOverlaySources} drawerOpen={drawerOpen} closeDrawer={closeDrawer} />
}
