import React, { useCallback, useEffect, useRef, useState } from "react"
import { LayersControl, MapContainer, TileLayer, useMapEvents } from "react-leaflet"

import "leaflet/dist/leaflet.css"
import { TCoordinate } from "../../data/types"
import { TLayerOverlay } from "../../data/types/TLayerOverlay"

import { BaseLayers } from "./BaseLayers"
import MapStateManager from "./MapStateManager"
import MapViewUpdater from "./MapViewUpdater"
import ZoomLevelDisplay from "./ZoomLevelDisplay"

export interface MapComponentProps {
  children?: React.ReactNode
  center: TCoordinate | [number, number]
  overlays?: TLayerOverlay[]
  contextMenuHandler?: (event: L.LeafletMouseEvent) => void
}

const MapComponent = ({ children, center, overlays, contextMenuHandler }: MapComponentProps): React.ReactElement => {
  const mapRef = useRef(null)
  const [activeBaseLayer] = useState("esriWorldStreetMap")
  const [mapState, setMapState] = useState({
    center: center,
    zoom: 13,
  })

  const MapEvents = () => {
    useMapEvents({
      contextmenu: contextMenuHandler,
    })

    return null
  }

  const restoreMapStateFromLocalStorage = useCallback(() => {
    const savedMapState = localStorage.getItem("mapState")

    if (savedMapState) {
      setMapState(JSON.parse(savedMapState))
    }
  }, [])

  useEffect(() => {
    restoreMapStateFromLocalStorage()
  }, [restoreMapStateFromLocalStorage])

  return (
    <>
      <MapContainer
        center={mapState.center}
        zoom={mapState.zoom}
        ref={mapRef}
        scrollWheelZoom={true}
        style={{ height: "100vh", width: "100%" }}
      >
        <MapEvents />
        <MapStateManager />
        <MapViewUpdater center={mapState.center} zoom={mapState.zoom} />
        <ZoomLevelDisplay />
        <LayersControl position="topright">
          {Object.entries(BaseLayers).map(([key, layer]) => (
            <LayersControl.BaseLayer key={key} name={layer.name} checked={activeBaseLayer === key}>
              <TileLayer attribution={layer.attribution} url={layer.url} maxZoom={layer.maxZoom || 20} />
            </LayersControl.BaseLayer>
          ))}

          {overlays && overlays.map((layerProps) => (
            <LayersControl.Overlay key={layerProps.name} name={layerProps.name} checked={layerProps.checked}>
              {layerProps.children}
            </LayersControl.Overlay>
          ))}
        </LayersControl>
        {children}
      </MapContainer>
    </>
  )
}

export default MapComponent
