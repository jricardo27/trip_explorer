import React from "react"
import { toast } from "react-toastify"

import MenuOption from "../../components/ContextMenu/MenuOption.tsx"
import MapContextMenu from "../../components/MapComponent/MapContextMenu.tsx"

const WAContextMenu = (): React.ReactNode => {
  const copyFeatureToClipboard = (payload: object) => {
    const coordinates = payload.coordinates

    const feature = {
      type: "Feature",
      properties: {
        name: "Location Name",
      },
      geometry: {
        type: "Point",
        coordinates: [coordinates.lng, coordinates.lat],
      },
    }

    navigator.clipboard
      .writeText(JSON.stringify(feature, null, 2))
      .then(() => {
        toast.success("Copied feature to clipboard")
      })
      .catch((error) => {
        toast.error(`Failed to copy feature to clipboard. ${error}`)
      })
  }

  return (
    <MapContextMenu>
      <MenuOption title="Copy feature to clipboard" handler={copyFeatureToClipboard} />
    </MapContextMenu>
  )
}

export default WAContextMenu
