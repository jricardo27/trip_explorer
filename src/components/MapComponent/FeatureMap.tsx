import L from "leaflet"
import React, { useMemo, useCallback, useEffect, useState } from "react"

import MapComponent, { LayerGroupChild, MapComponentProps } from "../../components/MapComponent/MapComponent.tsx"
import SavedFeaturesDrawer from "../../components/SavedFeaturesDrawer/SavedFeaturesDrawer.tsx"
import { GeoJsonFeature } from "../../data/types"
import { TTabMapping } from "../../data/types/TTabMapping.ts"
import useGeoJsonMarkers from "../../hooks/useGeoJsonMarkers.ts"
import StyledGeoJson, { contextMenuHandlerProps } from "../StyledGeoJson/StyledGeoJson.tsx"

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

  const onContextMenuHandler = useCallback(({ event, feature }: contextMenuHandlerProps) => {
    L.DomEvent.stopPropagation(event)
    setContextMenuPosition(event.latlng)
    setSelectedFeature(feature)
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
            <StyledGeoJson
              data={data}
              popupTabMapping={tabMapping}
              contextMenuHandler={onContextMenuHandler}
              popupProps={{ minWidth: 900, maxHeight: 500, keepInView: true }}
            />
          ),
        }
      },
      ))
    }
  }, [geoJsonOverlaySources, overlayMarkers, onContextMenuHandler])

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
