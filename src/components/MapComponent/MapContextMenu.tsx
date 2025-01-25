import React, { useState } from "react"
import { useMapEvents } from "react-leaflet"

import { TCoordinate, TPosition } from "../../data/types"
import ContextMenu from "../ContextMenu/ContextMenu.tsx"

interface IMapContextMenuProps {
  children: React.ReactNode
}

const MapContextMenu = ({ ...props }: IMapContextMenuProps): React.ReactNode => {
  const [menuPosition, setMenuPosition] = useState<TPosition | null>(null)
  const [coordinates, setCoordinates] = useState<TCoordinate | null>(null)

  const map = useMapEvents({
    contextmenu: (event) => {
      event.originalEvent.preventDefault() // Prevent default context menu

      // Get the clicked location's coordinates
      const { lat, lng } = event.latlng
      setCoordinates({ lat, lng })

      // Convert the click position to container coordinates
      const containerPoint = map.latLngToContainerPoint(event.latlng)
      setMenuPosition({ x: containerPoint.x, y: containerPoint.y })
    },
    click: () => {
      setTimeout(() => {
        setMenuPosition(null)
      }, 100)
    },
  })

  return (
    <>
      {menuPosition && (
        <ContextMenu position={menuPosition} onClose={() => setMenuPosition(null)} payload={{ coordinates: coordinates }}>
          {props.children}
        </ContextMenu>
      )}
    </>
  )
}

export default MapContextMenu
