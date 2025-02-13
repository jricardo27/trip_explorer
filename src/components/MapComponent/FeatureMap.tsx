import L from "leaflet"
import React, { useMemo, useCallback, useEffect, useState, useContext } from "react"

import MapComponent, { MapComponentProps } from "../../components/MapComponent/MapComponent"
import SavedFeaturesDrawer from "../../components/SavedFeaturesDrawer/SavedFeaturesDrawer"
import SavedFeaturesContext from "../../contexts/SavedFeaturesContext"
import { GeoJsonCollection, GeoJsonFeature } from "../../data/types"
import { TLayerOverlay } from "../../data/types/TLayerOverlay"
import { TTabMapping } from "../../data/types/TTabMapping"
import useGeoJsonMarkers from "../../hooks/useGeoJsonMarkers"
import styles from "../PopupContent/PopupContent.module.css"
import StyledGeoJson, { contextMenuHandlerProps } from "../StyledGeoJson/StyledGeoJson"

import FeatureMapContextMenu from "./FeatureMapContextMenu"

interface FeatureMapProps extends MapComponentProps {
  geoJsonOverlaySources: Record<string, TTabMapping>
}

export const FeatureMap = ({ geoJsonOverlaySources, ...mapProps }: FeatureMapProps): React.ReactNode => {
  const { savedFeatures } = useContext(SavedFeaturesContext)!

  const [contextMenuPosition, setContextMenuPosition] = useState<L.LatLng | null>(null)
  const [selectedFeature, setSelectedFeature] = useState<GeoJsonFeature | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [fixedOverlays, setFixedOverlays] = useState<TLayerOverlay[]>([])
  const [dynamicOverlays, setDynamicOverlays] = useState<TLayerOverlay[]>([])
  const overlayFilePaths = useMemo(() => (Object.keys(geoJsonOverlaySources)), [geoJsonOverlaySources])
  const overlayMarkers = useGeoJsonMarkers(overlayFilePaths)
  const popupProps = useMemo(() => ({ minWidth: 900, maxHeight: 500, autoPanPadding: L.point(160, 500) }), [])

  const onContextMenuHandler = useCallback(({ event, feature }: contextMenuHandlerProps) => {
    L.DomEvent.stopPropagation(event)
    setContextMenuPosition(event.latlng)
    setSelectedFeature(feature)
  }, [])

  useEffect(() => {
    if (!overlayMarkers.loading && !overlayMarkers.error) {
      setFixedOverlays(Object.entries(geoJsonOverlaySources).map(([filename, tabMapping]): TLayerOverlay => {
        const data = overlayMarkers[filename]
        const layerName = data?.properties?.style.layerName

        return {
          name: layerName,
          children: (
            <StyledGeoJson
              data={data}
              popupTabMapping={tabMapping}
              contextMenuHandler={onContextMenuHandler}
              popupProps={popupProps}
            />
          ),
        }
      }))
    }
  }, [geoJsonOverlaySources, overlayMarkers, onContextMenuHandler, popupProps])

  useEffect(() => {
    setDynamicOverlays(Object.entries(savedFeatures).map(([category, features]): TLayerOverlay => {
      const layerName = `- ${category}`
      const data: GeoJsonCollection = {
        type: "FeatureCollection",
        features: features,
        properties: {},
      }
      return {
        name: layerName,
        children: (
          <StyledGeoJson
            key={Date.now()}
            data={data}
            contextMenuHandler={onContextMenuHandler}
            popupProps={popupProps}
            popupTabMappingExtra={{ Notes: [{ key: "tripNotes", className: styles.scrollableContent, isHtml: true }] }}
          />
        ),
      }
    }))
  }, [savedFeatures, onContextMenuHandler, popupProps])

  return (
    <>
      <MapComponent overlays={[...fixedOverlays, ...dynamicOverlays]} {...mapProps}>
        <FeatureMapContextMenu selectedFeature={selectedFeature} menuLatLng={contextMenuPosition} />
      </MapComponent>
      <SavedFeaturesDrawer
        drawerOpen={drawerOpen}
        onClose={() => setDrawerOpen(!drawerOpen)}
      />
    </>
  )
}
