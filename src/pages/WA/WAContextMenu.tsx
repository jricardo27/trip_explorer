import L from "leaflet"
import React, { useContext } from "react"
import { toast } from "react-toastify"
import { v4 as uuidv4 } from "uuid"

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

  const getOrCreateFeature = (payload: object, selectedFeature: GeoJsonFeature | null): GeoJsonFeature => {
    let feature = selectedFeature

    if (!feature) {
      const newName = prompt("Enter new name for feature")
      const coordinates = payload.coordinates
      const featureId = uuidv4()

      feature = {
        type: "Feature",
        properties: {
          id: featureId,
          name: newName || `Location ${featureId}`,
        },
        geometry: {
          type: "Point",
          coordinates: [coordinates.lng, coordinates.lat],
        },
      }
    }

    return feature
  }

  const copyFeatureToClipboard = (payload: object, selectedFeature: GeoJsonFeature | null) => {
    const feature = getOrCreateFeature(payload, selectedFeature)

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
      <MenuOption title="Save feature to list" handler={(payload) => { addFeature("all", getOrCreateFeature(payload, props.selectedFeature)) }} />
    </MapContextMenu>
  )
}

export default WAContextMenu
