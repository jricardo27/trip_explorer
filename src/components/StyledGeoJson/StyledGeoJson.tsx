import L from "leaflet"
import React, { useCallback, useMemo } from "react"
import { createRoot } from "react-dom/client"
import { GeoJSON } from "react-leaflet"

import { GeoJsonFeature, GeoJsonCollection } from "../../data/types"
import { TTabMapping } from "../../data/types/TTabMapping.ts"
import createCustomIcon from "../../utils/createCustomIcon.tsx"
import styles from "../PopupContent/PopupContent.module.css"
import PopupContent from "../PopupContent/PopupContent.tsx"

export interface onPopupOpenProps {
  feature: GeoJsonFeature
  layer: L.Layer
  popupTabMapping: TTabMapping
}

export interface contextMenuHandlerProps {
  event: L.Event
  feature: GeoJsonFeature
}

export interface popupProps {
  minWidth: number
  maxHeight: number
  keepInView: boolean
}

interface StyleGeoJsonProps {
  data: GeoJsonCollection | null
  popupTabMapping?: TTabMapping
  popupTabMappingExtra?: TTabMapping
  popupOpenHandler?: ({ feature, layer, popupTabMapping }: onPopupOpenProps) => void
  contextMenuHandler?: ({ event, feature }: contextMenuHandlerProps) => void
  popupProps?: popupProps
}

const StyledGeoJson = ({
  data,
  popupTabMapping,
  popupTabMappingExtra,
  popupOpenHandler,
  contextMenuHandler,
  popupProps,
}: StyleGeoJsonProps): React.ReactNode => {
  const pointToLayer = useCallback((feature: GeoJsonFeature, latlng: unknown) => {
    const iconName = feature.properties.style?.icon || "fa/FaMapMarker"
    const iconColor = feature.properties.style?.color || "grey"
    const innerIconColor = feature.properties.style?.innerIconColor || iconColor
    const customIcon = createCustomIcon(iconName, iconColor, innerIconColor)
    return L.marker(latlng, { icon: customIcon })
  }, [])

  const defaultTabMapping: TTabMapping = useMemo(() => (
    {
      General: ["name", "url", { key: "description", className: styles.scrollableContent }],
    }
  ), [])

  const defaultOnPopupOpen = useCallback(({ feature, layer, popupTabMapping }: onPopupOpenProps) => {
    // Get the popup element
    const popup = layer.getPopup()
    if (popup) {
      // Create a container for the popup content
      const container = L.DomUtil.create("div")
      const root = createRoot(container)
      root.render(
        <PopupContent feature={feature as GeoJsonFeature} tabMapping={popupTabMapping} />,
      )

      // Set the popup content
      popup.setContent(container)
    }
  }, [])

  const onPopupOpenHandler = popupOpenHandler || defaultOnPopupOpen
  const tabMapping = Object.assign({}, popupTabMapping || defaultTabMapping, popupTabMappingExtra || {})

  return (
    <GeoJSON
      data={data}
      pointToLayer={pointToLayer}
      onEachFeature={(feature, layer) => {
        if (feature.properties) {
          if (feature.properties.name) {
            layer.bindTooltip(`${feature.properties.name}`, { permanent: false, direction: "auto" })
          }

          layer.bindPopup("", { ...popupProps || {} }) // Initialize with empty content

          // Add an event listener for when the popup opens
          layer.on("popupopen", () => {
            onPopupOpenHandler({ feature, layer, popupTabMapping: tabMapping })
          })

          if (contextMenuHandler) {
            layer.on("contextmenu", (event) => {
              contextMenuHandler({ event, feature })
            })
          }
        }
      }}
    />
  )
}

export default StyledGeoJson
