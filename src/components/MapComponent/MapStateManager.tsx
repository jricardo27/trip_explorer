import React, { useCallback } from "react"
import { useMap, useMapEvent } from "react-leaflet"

const MapStateManager = ({ onMapMove }: { onMapMove?: (center: [number, number], zoom: number) => void }): React.ReactNode => {
  const map = useMap()

  const saveMapState = useCallback(() => {
    const center = map.getCenter()
    const zoom = map.getZoom()
    const newMapState = {
      center: [center.lat, center.lng],
      zoom,
    }
    localStorage.setItem("mapState", JSON.stringify(newMapState))
    onMapMove?.([center.lat, center.lng], zoom)
  }, [map, onMapMove])

  // Handle both drag and zoom events
  useMapEvent("dragend", saveMapState)
  useMapEvent("zoomend", saveMapState)

  return null
}

export default MapStateManager
