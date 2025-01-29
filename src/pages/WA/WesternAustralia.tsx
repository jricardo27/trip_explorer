import L from "leaflet"
import React from "react"
import { GeoJSON } from "react-leaflet"

import MapComponent from "../../components/MapComponent/MapComponent.tsx"
import useGeoJsonMarkers from "../../hooks/useGeoJsonMarkers.ts"
import createCustomIcon from "../../utils/createCustomIcon.tsx"

import WAContextMenu from "./WAContextMenu.tsx"

const overlayFilePaths = [
  "/markers/westernAustralia/gas_stations_openstreetmap.json",
  "/markers/westernAustralia/gas_stations_fuelwatch.json",
  "/markers/westernAustralia/gas_stations_bp.json",
  "/markers/westernAustralia/national_parks_simplified.json",
  "/markers/westernAustralia/places.json",
]

export const WesternAustralia = (): React.ReactNode => {
  const overlayMarkers = useGeoJsonMarkers(overlayFilePaths)
  const PERTH_LOCATION = { lat: -31.953512, lng: 115.857048 }

  const pointToLayer = (feature: unknown, latlng: unknown) => {
    const iconName = feature.properties.style?.icon || "fa/FaMapMarker"
    const iconColor = feature.properties.style?.color || "grey"
    const customIcon = createCustomIcon(iconName, iconColor)
    return L.marker(latlng, { icon: customIcon })
  }

  let overlays = []

  if (!overlayMarkers.loading && !overlayMarkers.error) {
    overlays = overlayFilePaths.map((filename) => {
      const data = overlayMarkers[filename]
      const layerName = data.properties.style.layerName

      return {
        key: layerName,
        title: layerName,
        children: (
          <GeoJSON
            data={data}
            pointToLayer={pointToLayer}
            onEachFeature={(feature, layer) => {
              if (feature.properties && feature.properties.name) {
                layer.bindTooltip(`${feature.properties.name}`, { permanent: false, direction: "auto" })
              }
            }}
          />
        ),
      }
    })
  }

  return (
    <MapComponent center={PERTH_LOCATION} layerGroupChildren={overlays}>
      <WAContextMenu />
    </MapComponent>
  )
}
