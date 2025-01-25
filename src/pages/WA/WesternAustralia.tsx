import L from "leaflet"
import React from "react"
import { GeoJSON } from "react-leaflet"

import MapComponent from "../../components/MapComponent/MapComponent.tsx"
import useMarkersWA from "../../hooks/useMarkersWA.ts"
import createCustomIcon from "../../utils/createCustomIcon.tsx"

import WAContextMenu from "./WAContextMenu.tsx"

export const WesternAustralia = (): React.ReactNode => {
  const markersWA = useMarkersWA()
  const PERTH_LOCATION = { lat: -31.953512, lng: 115.857048 }

  const pointToLayer = (feature: unknown, latlng: unknown) => {
    const iconName = feature.properties.icon || "fa/FaMapMarker"
    const iconColor = feature.properties.color || "grey"
    const customIcon = createCustomIcon(iconName, iconColor)
    return L.marker(latlng, { icon: customIcon })
  }

  return (
    <MapComponent center={PERTH_LOCATION}>
      {markersWA.map((data, index) => (
        <GeoJSON
          key={index}
          data={data}
          pointToLayer={pointToLayer}
          onEachFeature={(feature, layer) => {
            if (feature.properties && feature.properties.name) {
              layer.bindTooltip(`${feature.properties.name}`, { permanent: false, direction: "auto" })
            }
          }}
        />
      ))}
      <WAContextMenu />
    </MapComponent>
  )
}
