import React, { useEffect } from "react";
import { useMap } from "react-leaflet";

import { TCoordinate } from "../../data/types";

interface IMapViewUpdaterProps {
  center: TCoordinate | [number, number];
  zoom: number;
  currentSearchResult?: TCoordinate | null;
}

const MapViewUpdater = ({ center, zoom, currentSearchResult }: IMapViewUpdaterProps): React.ReactNode => {
  const map = useMap();

  useEffect(() => {
    if (currentSearchResult) {
      map.flyTo([currentSearchResult.lat, currentSearchResult.lng], Math.max(map.getZoom(), 15));
    } else if (center && zoom) {
      // Ensure center is always [number, number] for setView
      const viewCenter: [number, number] = Array.isArray(center) ? center : [center.lat, center.lng];
      map.setView(viewCenter, zoom);
    }
  }, [center, zoom, map, currentSearchResult]);

  return null;
};

export default MapViewUpdater;
