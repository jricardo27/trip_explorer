import React, { useMemo } from "react";

import { FeatureMap } from "../../components/MapComponent/FeatureMap";
import styles from "../../components/PopupContent/PopupContent.module.css";
import { AUCKLAND_LOCATION } from "../../data/locations";
import { TCoordinate, TTabMapping } from "../../data/types";

interface NewZealandProps {
  drawerOpen: boolean;
  closeDrawer: () => void;
  currentSearchResult: TCoordinate | null;
}

export const NewZealand = ({ drawerOpen, closeDrawer, currentSearchResult }: NewZealandProps): React.ReactNode => {
  const geoJsonOverlaySources = useMemo(
    (): Record<string, TTabMapping> => ({
      "/markers/newZealand/accommodation_campermate.json": {
        General: ["name", "fees", "bookable", { key: "description", className: styles.scrollableContent }],
        Score: ["score", "thumbs_up", "thumbs_down"],
      },
    }), [])

  return <FeatureMap center={AUCKLAND_LOCATION} geoJsonOverlaySources={geoJsonOverlaySources} drawerOpen={drawerOpen} closeDrawer={closeDrawer} currentSearchResult={currentSearchResult} />
}
