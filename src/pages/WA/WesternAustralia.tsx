import L from "leaflet"
import React from "react"
import { createRoot } from "react-dom/client"
import { GeoJSON } from "react-leaflet"

import MapComponent from "../../components/MapComponent/MapComponent.tsx"
import PopupContent from "../../components/PopupContent/PopupContent.tsx"
import { GeoJsonFeature } from "../../data/types"
import useGeoJsonMarkers from "../../hooks/useGeoJsonMarkers.ts"
import createCustomIcon from "../../utils/createCustomIcon.tsx"

import WAContextMenu from "./WAContextMenu.tsx"

const overlayFilePaths = [
  "/markers/westernAustralia/gas_stations_openstreetmap.json",
  "/markers/westernAustralia/gas_stations_fuelwatch.json",
  "/markers/westernAustralia/gas_stations_bp.json",
  "/markers/westernAustralia/national_parks_simplified.json",
  "/markers/westernAustralia/accommodation_WA.json",
  "/markers/westernAustralia/accommodation_campermate.json",
  "/markers/westernAustralia/places.json",
]

export const WesternAustralia = (): React.ReactNode => {
  const overlayMarkers = useGeoJsonMarkers(overlayFilePaths)
  const PERTH_LOCATION = { lat: -31.953512, lng: 115.857048 }

  const pointToLayer = (feature: unknown, latlng: unknown) => {
    const iconName = feature.properties.style?.icon || "fa/FaMapMarker"
    const iconColor = feature.properties.style?.color || "grey"
    const innerIconColor = feature.properties.style?.innerIconColor || iconColor
    const customIcon = createCustomIcon(iconName, iconColor, innerIconColor)
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
              if (feature.properties) {
                if (feature.properties.name) {
                  layer.bindTooltip(`${feature.properties.name}`, { permanent: false, direction: "auto" })
                }

                layer.bindPopup("", { minWidth: 900, maxHeight: 500, keepInView: true }) // Initialize with empty content

                // Add an event listener for when the popup opens
                layer.on("popupopen", () => {
                // Get the popup element
                  const popup = layer.getPopup()
                  if (popup) {
                    // Create a container for the popup content
                    const container = L.DomUtil.create("div")
                    const root = createRoot(container)
                    root.render(
                      <PopupContent feature={feature as GeoJsonFeature} />,
                    )

                    // Set the popup content
                    popup.setContent(container)
                  }
                })
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
