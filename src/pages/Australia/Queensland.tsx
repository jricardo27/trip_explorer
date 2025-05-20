import React, { useMemo } from "react";

import { FeatureMap } from "../../components/MapComponent/FeatureMap";
import styles from "../../components/PopupContent/PopupContent.module.css";
import { BRISBANE_LOCATION } from "../../data/locations";
import { TCurrentSearchResult, TTabMapping } from "../../data/types"; // Updated TCoordinate to TCurrentSearchResult

interface QueenslandProps {
  drawerOpen: boolean;
  closeDrawer: () => void;
  currentSearchResult: TCurrentSearchResult; // Updated type
}

export const Queensland = ({ drawerOpen, closeDrawer, currentSearchResult }: QueenslandProps): React.ReactNode => {
  const geoJsonOverlaySources = useMemo(
    (): Record<string, TTabMapping> => ({
      "/markers/queensland/accommodation_QLD.json": {
        General: ["name", "website", "tarif", "isBookable"],
        "More Info": ["operatorName", "GroupName", "CheckInTime", "CheckOutTime", "email", "address", "hours"],
      },
      "/markers/queensland/accommodation_campermate.json": {
        General: ["name", "fees", "bookable", { key: "description", className: styles.scrollableContent }],
        Score: ["score", "thumbs_up", "thumbs_down"],
      },
      "/markers/queensland/toiletmap_aus_2025_QLD.json": {
        General: ["Name", "Male", "Female", "Unisex", "Shower", "OpeningHours", "OpeningHoursNote", "Address1", "URL"],
      },
      "/markers/queensland/big4_holiday_parks_QLD.json": {
        General: ["name", "website", "reviews"],
      },
      "/markers/queensland/discovery_parks_QLD.json": {
        General: ["name", "area", "website", "reviews"],
      },
    }), [])

  return <FeatureMap center={BRISBANE_LOCATION} geoJsonOverlaySources={geoJsonOverlaySources} drawerOpen={drawerOpen} closeDrawer={closeDrawer} currentSearchResult={currentSearchResult} />
}
