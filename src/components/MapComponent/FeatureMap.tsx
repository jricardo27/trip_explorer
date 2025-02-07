import L from "leaflet"
import React, { useMemo, useCallback, useEffect, useState } from "react"
import { createRoot } from "react-dom/client"
import { GeoJSON } from "react-leaflet"

import MapComponent, { LayerGroupChild, MapComponentProps } from "../../components/MapComponent/MapComponent.tsx"
import PopupContent from "../../components/PopupContent/PopupContent.tsx"
import SavedFeaturesDrawer from "../../components/SavedFeaturesDrawer/SavedFeaturesDrawer.tsx"
import { GeoJsonFeature } from "../../data/types"
import { TTabMapping } from "../../data/types/TTabMapping.ts"
import useGeoJsonMarkers from "../../hooks/useGeoJsonMarkers.ts"
import createCustomIcon from "../../utils/createCustomIcon.tsx"

import FeatureMapContextMenu from "./FeatureMapContextMenu.tsx"

interface FeatureMapProps extends MapComponentProps {
  geoJsonOverlaySources: Record<string, TTabMapping>
}

export const FeatureMap = ({ geoJsonOverlaySources, ...mapProps }: FeatureMapProps): React.ReactNode => {
  const [contextMenuPosition, setContextMenuPosition] = useState<L.LatLng | null>(null)
  const [selectedFeature, setSelectedFeature] = useState<GeoJsonFeature | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [overlays, setOverlays] = useState<LayerGroupChild[]>([])
  const overlayFilePaths = useMemo(() => (Object.keys(geoJsonOverlaySources)), [geoJsonOverlaySources])
  const overlayMarkers = useGeoJsonMarkers(overlayFilePaths)

  const pointToLayer = useCallback((feature: GeoJsonFeature, latlng: unknown) => {
    const iconName = feature.properties.style?.icon || "fa/FaMapMarker"
    const iconColor = feature.properties.style?.color || "grey"
    const innerIconColor = feature.properties.style?.innerIconColor || iconColor
    const customIcon = createCustomIcon(iconName, iconColor, innerIconColor)
    return L.marker(latlng, { icon: customIcon })
  }, [])

  useEffect(() => {
    if (!overlayMarkers.loading && !overlayMarkers.error) {
      setOverlays(Object.entries(geoJsonOverlaySources).map(([filename, tabMapping]) => {
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
      }))
    }
  }, [geoJsonOverlaySources, overlayMarkers, pointToLayer])

  return (
    <>
      <MapComponent layerGroupChildren={overlays} {...mapProps}>
        <FeatureMapContextMenu selectedFeature={selectedFeature} menuLatLng={contextMenuPosition} />
      </MapComponent>
      <SavedFeaturesDrawer
        drawerOpen={drawerOpen}
        onClose={() => setDrawerOpen(!drawerOpen)}
      />
    </>
  )
}
