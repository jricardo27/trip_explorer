import React, { useEffect, useRef, useState } from "react"
import { LayerGroup, LayersControl, MapContainer, TileLayer } from "react-leaflet"

import "leaflet/dist/leaflet.css"
import { TCoordinate } from "../../data/types"

import { BaseLayers } from "./BaseLayers"
import MapStateManager from "./MapStateManager.tsx"
import MapViewUpdater from "./MapViewUpdater.tsx"
import ZoomLevelDisplay from "./ZoomLevelDisplay"

interface LayerGroupChild {
  key: string
  title: string
  children: React.ReactNode
}

type TMapProps = {
  children?: React.ReactNode
  center: TCoordinate | [number, number]
  layerGroupChildren?: LayerGroupChild[]
}

const MapComponent = ({ children, center, layerGroupChildren }: TMapProps): React.ReactElement => {
  const mapRef = useRef(null)
  const [activeBaseLayer] = useState("esriWorldStreetMap")
  const [mapState, setMapState] = useState({
    center: center,
    zoom: 13,
  })

  // Restore map state from localStorage on initial load
  useEffect(() => {
    const savedMapState = localStorage.getItem("mapState")

    if (savedMapState) {
      setMapState(JSON.parse(savedMapState))
    }
  }, [])

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

          {layerGroupChildren?.map((child, index) => (
            <LayersControl.Overlay key={child?.key || index} name={child.title}>
              <LayerGroup>{child.children}</LayerGroup>
            </LayersControl.Overlay>
          ))}
        </LayersControl>
        {children}
      </MapContainer>
    </>
  )
}

export default MapComponent
