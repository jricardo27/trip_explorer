import React from "react"
import { useMap, useMapEvent } from "react-leaflet"

const MapStateManager = (): React.ReactNode => {
  const map = useMap()

  // Save map state to localStorage when the map moves
  useMapEvent("moveend", () => {
    const center = map.getCenter()
    const zoom = map.getZoom()
    const newMapState = {
      center: [center.lat, center.lng],
      zoom,
    }

    localStorage.setItem("mapState", JSON.stringify(newMapState))
  })

  return null
}

export default MapStateManager
