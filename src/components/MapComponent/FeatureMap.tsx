import { useMediaQuery, useTheme } from "@mui/material"
import L, { PopupOptions } from "leaflet"
import React, { useMemo, useCallback, useEffect, useState, useContext } from "react"
import { MdAssignmentAdd } from "react-icons/md"
import { toast } from "react-toastify"

import MapComponent, { MapComponentProps } from "../../components/MapComponent/MapComponent"
import SavedFeaturesDrawer from "../../components/SavedFeaturesDrawer/SavedFeaturesDrawer"
import SavedFeaturesContext, { DEFAULT_CATEGORY } from "../../contexts/SavedFeaturesContext"
import { GeoJsonCollection, GeoJsonFeature } from "../../data/types"
import { TLayerOverlay } from "../../data/types/TLayerOverlay"
import { TTabMapping } from "../../data/types/TTabMapping"
import useGeoJsonMarkers from "../../hooks/useGeoJsonMarkers"
import styles from "../PopupContent/PopupContent.module.css"
import { iPopupContainerProps } from "../PopupContent/PopupContent.tsx"
import StyledGeoJson, { contextMenuHandlerProps } from "../StyledGeoJson/StyledGeoJson"

import FeatureMapContextMenu from "./FeatureMapContextMenu"

interface FeatureMapProps extends MapComponentProps {
  geoJsonOverlaySources: Record<string, TTabMapping>
  drawerOpen: boolean
  closeDrawer: () => void
}

export const FeatureMap = ({ geoJsonOverlaySources, drawerOpen, closeDrawer, ...mapProps }: FeatureMapProps): React.ReactNode => {
  const { addFeature, savedFeatures } = useContext(SavedFeaturesContext)!

  // 1. State variable for dynamic map center
  const [dynamicCenter, setDynamicCenter] = useState<[number, number] | undefined>(mapProps.center)
  const [contextMenuPosition, setContextMenuPosition] = useState<L.LatLng | null>(null)
  const [selectedFeature, setSelectedFeature] = useState<GeoJsonFeature | null>(null)
  const [fixedOverlays, setFixedOverlays] = useState<TLayerOverlay[]>([])
  const [dynamicOverlays, setDynamicOverlays] = useState<TLayerOverlay[]>([])
  const overlayFilePaths = useMemo(() => (Object.keys(geoJsonOverlaySources)), [geoJsonOverlaySources])
  const overlayMarkers = useGeoJsonMarkers(overlayFilePaths)

  const theme = useTheme()
  const isXs = useMediaQuery(theme.breakpoints.down("sm"))
  const isSm = useMediaQuery(theme.breakpoints.between("sm", "md"))
  const isMd = useMediaQuery(theme.breakpoints.between("md", "lg"))
  const [popupProps, setPopupProps] = useState<PopupOptions>({})
  const [popupContainerProps, setPopupContainerProps] = useState<iPopupContainerProps>({})

  // 2. useEffect to update dynamicCenter when mapProps.center changes
  useEffect(() => {
    setDynamicCenter(mapProps.center)
  }, [mapProps.center])

  useEffect(() => {
    const width = isMd ? 600 : isSm ? 450 : isXs ? 275 : 900
    const height = isMd ? 450 : isSm ? 400 : isXs ? 350 : 500

    setPopupProps({
      minWidth: width,
      maxWidth: width,
      maxHeight: height,
      autoPanPadding: isMd ? L.point(100, 300) : isSm ? L.point(10, 420) : isXs ? L.point(50, 100) : L.point(160, 500),
    })

    setPopupContainerProps({
      height: height,
    })
  }, [isXs, isSm, isMd, setPopupProps, setPopupContainerProps])

  const onMapContextMenuHandler = useCallback((event: L.LeafletMouseEvent) => {
    L.DomEvent.stopPropagation(event)
    event.originalEvent.preventDefault()
    setContextMenuPosition(event.latlng)
    setSelectedFeature(null)
  }, [])

  const onFeatureContextMenuHandler = useCallback(({ event, feature }: contextMenuHandlerProps) => {
    L.DomEvent.stopPropagation(event)
    setContextMenuPosition(event.latlng)
    setSelectedFeature(feature)
  }, [])

  const onSaveFeatureToList = useCallback((feature: GeoJsonFeature) => {
    addFeature(DEFAULT_CATEGORY, feature)
    toast.success("Saved")
  }, [addFeature])

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
              contextMenuHandler={onFeatureContextMenuHandler}
              popupProps={popupProps}
              popupContainerProps={popupContainerProps}
              popupActionButtons={[{
                label: "Save",
                startIcon: <MdAssignmentAdd />,
                onClick: onSaveFeatureToList }]}
            />
          ),
        }
      }))
    }
  }, [geoJsonOverlaySources, overlayMarkers, onFeatureContextMenuHandler, popupProps, popupContainerProps, onSaveFeatureToList])

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
            contextMenuHandler={onFeatureContextMenuHandler}
            popupProps={popupProps}
            popupTabMappingExtra={{ Notes: [{ key: "tripNotes", className: styles.scrollableContent, isHtml: true }] }}
            popupContainerProps={popupContainerProps}
          />
        ),
      }
    }))
  }, [savedFeatures, onFeatureContextMenuHandler, popupProps, popupContainerProps])

  // 4. Callback to handle navigation
  const handleNavigateToCoordinates = useCallback((coords: [number, number]) => {
    // Leaflet expects [lat, lng]. Ensure coords are in this format.
    // GeoJSON is typically [lng, lat]. This will be handled when the callback is called.
    setDynamicCenter(coords)
  }, [])

  return (
    <>
      {/* 3. Use dynamicCenter in MapComponent */}
      <MapComponent
        overlays={[...fixedOverlays, ...dynamicOverlays]}
        contextMenuHandler={onMapContextMenuHandler}
        {...mapProps}
        center={dynamicCenter}
      >
        <FeatureMapContextMenu selectedFeature={selectedFeature} menuLatLng={contextMenuPosition} />
      </MapComponent>
      {/* 5. Pass handleNavigateToCoordinates to SavedFeaturesDrawer */}
      <SavedFeaturesDrawer
        drawerOpen={drawerOpen}
        onClose={closeDrawer}
        navigateToCoordinates={handleNavigateToCoordinates}
      />
    </>
  )
}
