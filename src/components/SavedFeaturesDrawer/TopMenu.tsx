import Button from "@mui/material/Button"
import Fade from "@mui/material/Fade"
import Menu from "@mui/material/Menu"
import MenuItem from "@mui/material/MenuItem"
import FileSaver from "file-saver"
import tokml from "geojson-to-kml"
import JSZip from "jszip"
import * as React from "react"
import { useCallback } from "react"

import { SavedFeaturesStateType } from "../../contexts/SavedFeaturesContext"
import { GeoJsonCollection, GeoJsonFeature } from "../../data/types"
import formatFeature from "../../utils/formatFeature"

interface TopMenuProps {
  savedFeatures: SavedFeaturesStateType
}

const TopMenu = ({ savedFeatures }: TopMenuProps) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  const wrapper = (handler: (event: React.MouseEvent) => void) => {
    return (event: React.MouseEvent) => {
      handler(event)
      handleClose()
    }
  }

  const saveAsGeoJson = useCallback(() => {
    const zip = new JSZip()

    Object.entries(savedFeatures).map(([category, features]) => {
      const data: GeoJsonCollection = {
        type: "FeatureCollection",
        features: features,
      }

      zip.file(`${category}.geojson`, JSON.stringify(data))
    })

    zip.generateAsync({ type: "blob" }).then((blob) => {
      FileSaver.saveAs(blob, "trip_explorer_features.json.zip")
    })
  }, [savedFeatures])

  const saveAsKml = useCallback(() => {
    const zip = new JSZip()

    Object.entries(savedFeatures).map(([category, features]) => {
      const data: GeoJsonCollection = {
        type: "FeatureCollection",
        features: features.map((feature): GeoJsonFeature => (formatFeature(feature))),
      }

      const kml: string = tokml(data)
      zip.file(`${category}.kml`, kml)
    })

    zip.generateAsync({ type: "blob" }).then((blob) => {
      FileSaver.saveAs(blob, "trip_explorer_features.kml.zip")
    })
  }, [savedFeatures])

  return (
    <div>
      <Button
        id="fade-button"
        aria-controls={open ? "fade-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
      >
        Export
      </Button>
      <Menu
        id="fade-menu"
        MenuListProps={{
          "aria-labelledby": "fade-button",
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        TransitionComponent={Fade}
      >
        <MenuItem onClick={wrapper(saveAsGeoJson)}>To GeoJson</MenuItem>
        <MenuItem onClick={wrapper(saveAsKml)}>To KML</MenuItem>
      </Menu>
    </div>
  )
}

export default TopMenu
