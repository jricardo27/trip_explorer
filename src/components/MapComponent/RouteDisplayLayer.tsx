import React, { useContext, useEffect, useRef } from "react"
import { useMap } from "react-leaflet"
import L from "leaflet"
import * as GeoJSON from "geojson"

import SavedFeaturesContext from "../../contexts/SavedFeaturesContext"

const RouteDisplayLayer: React.FC = () => {
  const map = useMap()
  const { activeRouteGeoJson } = useContext(SavedFeaturesContext)!
  const routeLayerRef = useRef<L.GeoJSON | null>(null)

  useEffect(() => {
    // Remove existing route layer if it exists
    if (routeLayerRef.current) {
      map.removeLayer(routeLayerRef.current)
      routeLayerRef.current = null
    }

    // Add new route if activeRouteGeoJson is not null
    if (activeRouteGeoJson) {
      routeLayerRef.current = L.geoJSON(activeRouteGeoJson, {
        style: {
          color: "#ff0000", // Red color for the route
          weight: 3,
          opacity: 0.7,
        },
      }).addTo(map)

      // Optionally, fit map bounds to the route
      // if (routeLayerRef.current.getBounds().isValid()) {
      //   map.fitBounds(routeLayerRef.current.getBounds())
      // }
    }
  }, [activeRouteGeoJson, map])

  return null // This component does not render any direct DOM elements
}

export default RouteDisplayLayer
