import React, { useEffect } from "react";
import { useMap } from "react-leaflet";

import { TCoordinate, TCurrentSearchResult } from "../../data/types"; // Added TCurrentSearchResult

interface IMapViewUpdaterProps {
  center: TCoordinate | [number, number];
  zoom: number;
  currentSearchResult?: TCurrentSearchResult; // Updated type
}

const MapViewUpdater = ({ center, zoom, currentSearchResult }: IMapViewUpdaterProps): React.ReactNode => {
  const map = useMap();

  useEffect(() => {
    if (currentSearchResult && currentSearchResult.coordinate) {
      map.flyTo([currentSearchResult.coordinate.lat, currentSearchResult.coordinate.lng], Math.max(map.getZoom(), 15));
    } else if (center && zoom) {
      // Ensure center is always [number, number] for setView
      const viewCenter: [number, number] = Array.isArray(center) ? center : [center.lat, center.lng];
      map.setView(viewCenter, zoom);
    }
  }, [center, zoom, map, currentSearchResult]);

  return null;
};

export default MapViewUpdater;
