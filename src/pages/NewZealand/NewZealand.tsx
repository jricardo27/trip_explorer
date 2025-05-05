import React, { useMemo } from "react"

import { FeatureMap } from "../../components/MapComponent/FeatureMap"
import styles from "../../components/PopupContent/PopupContent.module.css"
import { AUCKLAND_LOCATION } from "../../data/locations"
import { TTabMapping } from "../../data/types/TTabMapping"

interface NewZealandProps {
  drawerOpen: boolean
  closeDrawer: () => void
}

export const NewZealand = ({ drawerOpen, closeDrawer }: NewZealandProps): React.ReactNode => {
  const geoJsonOverlaySources = useMemo(
    (): Record<string, TTabMapping> => ({
      "/markers/newZealand/accommodation_campermate.json": {
        General: ["name", "fees", "bookable", { key: "description", className: styles.scrollableContent }],
        Score: ["score", "thumbs_up", "thumbs_down"],
      },
    }), [])

  return <FeatureMap center={AUCKLAND_LOCATION} geoJsonOverlaySources={geoJsonOverlaySources} drawerOpen={drawerOpen} closeDrawer={closeDrawer} />
}
