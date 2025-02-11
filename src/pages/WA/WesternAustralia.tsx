import React, { useMemo } from "react"

import { FeatureMap } from "../../components/MapComponent/FeatureMap"
import styles from "../../components/PopupContent/PopupContent.module.css"

export const WesternAustralia = (): React.ReactNode => {
  const PERTH_LOCATION = useMemo(() => ({ lat: -31.953512, lng: 115.857048 }), [])
  const geoJsonOverlaySources = useMemo(
    () => ({
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
      "/markers/westernAustralia/places.json": {
        General: ["name"],
      },
    }), [])

  return <FeatureMap center={PERTH_LOCATION} geoJsonOverlaySources={geoJsonOverlaySources} />
}
