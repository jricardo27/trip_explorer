import L from "leaflet"
import React, { useContext } from "react"
import { toast } from "react-toastify"

import MenuOption from "../../components/ContextMenu/MenuOption.tsx"
import MapContextMenu from "../../components/MapComponent/MapContextMenu.tsx"
import SavedFeaturesContext from "../../contexts/SavedFeaturesContext.ts"
import { GeoJsonFeature } from "../../data/types"

interface iWAContextMenuProps {
  menuLatLng?: L.LatLng | undefined
  selectedFeature: GeoJsonFeature | null
}

const WAContextMenu = ({ ...props }: iWAContextMenuProps): React.ReactNode => {
  const { addFeature } = useContext(SavedFeaturesContext)!

  const copyFeatureToClipboard = (payload: object, selectedFeature: GeoJsonFeature | null) => {
    let feature = selectedFeature

    if (!feature) {
      const coordinates = payload.coordinates

      feature = {
        type: "Feature",
        properties: {
          name: "Location Name",
        },
        geometry: {
          type: "Point",
          coordinates: [coordinates.lng, coordinates.lat],
        },
      }
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
    <MapContextMenu latlng={props.menuLatLng}>
      <MenuOption title="Copy feature to clipboard" handler={(payload) => { copyFeatureToClipboard(payload, props.selectedFeature) }} />
      <MenuOption title="Save feature to list" handler={() => { addFeature("all", props.selectedFeature) }} />
    </MapContextMenu>
  )
}

export default WAContextMenu
