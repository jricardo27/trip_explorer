import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { LayerGroup, LayersControl, MapContainer, TileLayer } from "react-leaflet"

import "leaflet/dist/leaflet.css"
import { TCoordinate } from "../../data/types"

import { BaseLayers } from "./BaseLayers"
import MapStateManager from "./MapStateManager.tsx"
import MapViewUpdater from "./MapViewUpdater.tsx"
import ZoomLevelDisplay from "./ZoomLevelDisplay"

export interface LayerGroupChild {
  id: string
  title: string
  children: React.ReactNode
}

export interface MapComponentProps {
  children?: React.ReactNode
  center: TCoordinate | [number, number]
  layerGroupChildren?: LayerGroupChild[]
}

const MapComponent = ({ children, center, layerGroupChildren }: MapComponentProps): React.ReactElement => {
  const mapRef = useRef(null)
  const [activeBaseLayer] = useState("esriWorldStreetMap")
  const [mapState, setMapState] = useState({
    center: center,
    zoom: 13,
  })

  const restoreMapStateFromLocalStorage = useCallback(() => {
    const savedMapState = localStorage.getItem("mapState")

    if (savedMapState) {
      setMapState(JSON.parse(savedMapState))
    }
  }, [])

  useEffect(() => {
    restoreMapStateFromLocalStorage()
  }, [restoreMapStateFromLocalStorage])

  const layerGroupChildrenMemo = useMemo(() => {
    return layerGroupChildren?.map((child) => (
      <LayersControl.Overlay key={child.id} name={child.title}>
        <LayerGroup>{child.children}</LayerGroup>
      </LayersControl.Overlay>
    ))
  }, [layerGroupChildren])

  return (
    <>
      <MapContainer
        center={mapState.center}
        zoom={mapState.zoom}
        ref={mapRef}
        scrollWheelZoom={true}
        style={{ height: "100vh", width: "100%" }}
      >
        <MapStateManager />
        <MapViewUpdater center={mapState.center} zoom={mapState.zoom} />
        <ZoomLevelDisplay />
        <LayersControl position="topright">
          {Object.entries(BaseLayers).map(([key, layer]) => (
            <LayersControl.BaseLayer key={key} name={layer.name} checked={activeBaseLayer === key}>
              <TileLayer attribution={layer.attribution} url={layer.url} maxZoom={layer.maxZoom || 20} />
            </LayersControl.BaseLayer>
          ))}

          {layerGroupChildrenMemo}
        </LayersControl>
        {children}
      </MapContainer>
    </>
  )
}

export default MapComponent
