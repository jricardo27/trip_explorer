import L from "leaflet"
import React, { useCallback, useEffect, useState } from "react"
import { LayersControl, MapContainer, TileLayer } from "react-leaflet"

import "leaflet/dist/leaflet.css"
import { TCoordinate } from "../../data/types"
import { TLayerOverlay } from "../../data/types/TLayerOverlay"

import { BaseLayers } from "./BaseLayers"
import MapEvents from "./MapEvents"
import MapStateManager from "./MapStateManager"
import MapViewUpdater from "./MapViewUpdater"
import ZoomLevelDisplay from "./ZoomLevelDisplay"

/**
 * Props for the MapComponent.
 */
export interface MapComponentProps {
  /** Optional child elements to render within the MapContainer, typically map layers or controls. */
  children?: React.ReactNode;
  /** The initial center of the map. Can be a TCoordinate object or a [lat, lng] tuple. */
  center: TCoordinate | [number, number];
  /** Optional array of overlay layers (TLayerOverlay) to be managed by the LayersControl. */
  overlays?: TLayerOverlay[];
  /** Optional callback function to handle context menu events on the map. */
  contextMenuHandler?: (event: L.LeafletMouseEvent) => void;
}

/**
 * A configurable map component based on React Leaflet.
 *
 * This component initializes a Leaflet map with base layers, optional overlays,
 * and persists map state (center, zoom, active base layer, overlay visibility)
 * to localStorage. It also provides context menu handling and displays the current zoom level.
 *
 * @param props The properties for configuring the map component.
 * @returns A ReactElement rendering the map.
 */
const MapComponent = ({
  children,
  center,
  overlays,
  contextMenuHandler,
}: MapComponentProps): React.ReactElement => {
  const [mapState, setMapState] = useState(() => {
    const saved = localStorage.getItem("mapState")

    if (saved) {
      const parsed = JSON.parse(saved)
      return {
        center: parsed.center,
        zoom: parsed.zoom,
      }
    }
    return {
      center: center,
      zoom: 13,
    }
  })

  const [overlayVisibility, setOverlayVisibility] = useState<Record<string, boolean>>(() => {
    const savedOverlayVisibility = localStorage.getItem("overlayVisibility")
    return savedOverlayVisibility ? JSON.parse(savedOverlayVisibility) : {}
  })

  const [activeBaseLayer, setActiveBaseLayer] = useState<string>(() => {
    const savedBaseLayer = localStorage.getItem("activeBaseLayer")
    return savedBaseLayer ?? "Esri World Street Map"
  })

  /**
   * Memoized version of setOverlayVisibility to maintain stable references for child components.
   * Updates the visibility state of overlay layers.
   */
  const memoizedSetOverlayVisibility = useCallback(
    (newVisibility: React.SetStateAction<Record<string, boolean>>) => {
      setOverlayVisibility(newVisibility)
    },
    [],
  )

  /**
   * Memoized version of setActiveBaseLayer to maintain stable references for child components.
   * Updates the currently active base layer.
   */
  const memoizedSetActiveBaseLayer = useCallback(
    (newBaseLayer: React.SetStateAction<string>) => {
      setActiveBaseLayer(newBaseLayer)
    },
    [],
  )

  useEffect(() => {
    localStorage.setItem("overlayVisibility", JSON.stringify(overlayVisibility))
  }, [overlayVisibility])

  useEffect(() => {
    localStorage.setItem("activeBaseLayer", activeBaseLayer)
  }, [activeBaseLayer])

  /**
   * Callback function to update the map's center and zoom level in the component's state.
   * This state is then persisted to localStorage by the MapStateManager component.
   *
   * @param center A tuple representing the new latitude and longitude of the map center.
   * @param zoom The new zoom level of the map.
   */
  const handleMapMove = useCallback((center: [number, number], zoom: number) => {
    setMapState({ center, zoom })
  }, [])

  return (
    <>
      <MapContainer
        center={mapState.center}
        zoom={mapState.zoom}
        scrollWheelZoom={true}
        style={{ height: "100vh", width: "100%" }}
      >
        <MapEvents
          setOverlayVisibility={memoizedSetOverlayVisibility}
          setActiveBaseLayer={memoizedSetActiveBaseLayer}
          contextMenuHandler={contextMenuHandler}
        />
        <MapStateManager onMapMove={handleMapMove} />
        <MapViewUpdater center={mapState.center} zoom={mapState.zoom} />
        <ZoomLevelDisplay />
        <LayersControl position="topright">
          {Object.entries(BaseLayers).map(([key, layer]) => (
            <LayersControl.BaseLayer
              key={key}
              name={layer.name}
              checked={activeBaseLayer === layer.name}
            >
              <TileLayer
                attribution={layer.attribution}
                url={layer.url}
                maxZoom={layer.maxZoom || 20}
              />
            </LayersControl.BaseLayer>
          ))}

          {overlays &&
            overlays.map((layerProps) => (
              <LayersControl.Overlay
                key={layerProps.name}
                name={layerProps.name}
                checked={
                  overlayVisibility[layerProps.name] !== undefined
                    ? overlayVisibility[layerProps.name]
                    : layerProps.checked !== undefined
                      ? layerProps.checked
                      : false
                }
              >
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
