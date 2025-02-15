import L from "leaflet"
import React, { useContext } from "react"
import { toast } from "react-toastify"
import { v4 as uuidv4 } from "uuid"

import MenuOption, { MenuOptionPayload } from "../../components/ContextMenu/MenuOption"
import MapContextMenu from "../../components/MapComponent/MapContextMenu"
import SavedFeaturesContext, { DEFAULT_CATEGORY } from "../../contexts/SavedFeaturesContext"
import { GeoJsonFeature } from "../../data/types"

interface FeatureMapContextMenuProps {
  menuLatLng?: L.LatLng | null
  selectedFeature?: GeoJsonFeature | null
}

const FeatureMapContextMenu = ({ ...props }: FeatureMapContextMenuProps): React.ReactNode => {
  const { addFeature } = useContext(SavedFeaturesContext)!

  const getOrCreateFeature = (payload: MenuOptionPayload, selectedFeature?: GeoJsonFeature | null): GeoJsonFeature => {
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

  const copyFeatureToClipboard = (payload: MenuOptionPayload, selectedFeature?: GeoJsonFeature | null) => {
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

  if (!props.menuLatLng) return null

  return (
    <MapContextMenu latlng={props.menuLatLng}>
      <MenuOption title="Copy feature to clipboard" handler={(payload: MenuOptionPayload) => { copyFeatureToClipboard(payload, props.selectedFeature) }} />
      <MenuOption
        title="Save feature to list"
        handler={(payload: MenuOptionPayload) => { addFeature(DEFAULT_CATEGORY, getOrCreateFeature(payload, props.selectedFeature)) }}
      />
    </MapContextMenu>
  )
}

export default FeatureMapContextMenu
