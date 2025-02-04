import L from "leaflet"
import React, { useState } from "react"
import { createRoot } from "react-dom/client"
import { GeoJSON } from "react-leaflet"

import MapComponent from "../../components/MapComponent/MapComponent.tsx"
import styles from "../../components/PopupContent/PopupContent.module.css"
import PopupContent from "../../components/PopupContent/PopupContent.tsx"
import { GeoJsonFeature } from "../../data/types"
import { TTabMapping } from "../../data/types/TTabMapping.ts"
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
  const [contextMenuPosition, setContextMenuPosition] = useState<L.LatLng | null>(null)
  const [selectedFeature, setSelectedFeature] = useState<GeoJsonFeature | null>(null)

  const overlayMarkers = useGeoJsonMarkers(overlayFilePaths)
  const PERTH_LOCATION = { lat: -31.953512, lng: 115.857048 }

  const pointToLayer = (feature: unknown, latlng: unknown) => {
    const iconName = feature.properties.style?.icon || "fa/FaMapMarker"
    const iconColor = feature.properties.style?.color || "grey"
    const innerIconColor = feature.properties.style?.innerIconColor || iconColor
    const customIcon = createCustomIcon(iconName, iconColor, innerIconColor)
    return L.marker(latlng, { icon: customIcon })
  }

  const popupTabMappings: Record<string, TTabMapping> = {
    default: {
      General: ["name", { key: "description", className: styles.scrollableContent }],
    },
    "National Parks": {
      General: ["name", "url", { key: "description", className: styles.scrollableContent }],
    },
    "Accommodation (Campermate)": {
      General: ["name", "fees", "bookable", { key: "description", className: styles.scrollableContent }],
      Score: ["score", "thumbs_up", "thumbs_down"],
    },
    "Accommodation in WA": {
      General: ["name", "website", "tarif", "isBookable"],
      "More Info": ["operatorName", "GroupName", "CheckInTime", "CheckOutTime", "email", "address", "hours"],
    },
    "Gas Stations [BP]": {
      General: ["name", "address", { key: "facilities", className: styles.scrollableContent }],
      "More Info": [{ key: "products", className: styles.scrollableContent }, "website", "telephone"],
    },
    "Gas Stations [Fuelwatch]": {
      General: ["name", "brandName", "manned", "operates247"],
    },
    "Gas Stations [OpenStreetMap]": {
      General: ["name", "brand", "operator", "opening_hours"],
    },
  }

  let overlays = []

  if (!overlayMarkers.loading && !overlayMarkers.error) {
    overlays = overlayFilePaths.map((filename) => {
      const data = overlayMarkers[filename]
      const layerName = data.properties.style.layerName
      const tabMapping = layerName in popupTabMappings ? popupTabMappings[layerName] : popupTabMappings["default"]

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
                      <PopupContent feature={feature as GeoJsonFeature} tabMapping={tabMapping} />,
                    )

                    // Set the popup content
                    popup.setContent(container)
                  }
                })

                layer.on("contextmenu", (event) => {
                  L.DomEvent.stopPropagation(event)
                  setContextMenuPosition(event.latlng)
                  setSelectedFeature(feature as GeoJsonFeature)
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
      <WAContextMenu selectedFeature={selectedFeature} menuLatLng={contextMenuPosition} />
    </MapComponent>
  )
}
