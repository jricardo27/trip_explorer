import Button from "@mui/material/Button"
import Fade from "@mui/material/Fade"
import Menu from "@mui/material/Menu"
import MenuItem from "@mui/material/MenuItem"
import React, { useContext, useState } from "react"

import SavedFeaturesContext from "../../../contexts/SavedFeaturesContext"

import { saveAsGeoJson } from "./saveAsGeoJson.ts"
import { saveAsKml } from "./saveAsKml.ts"

const TopMenu = () => {
  const { savedFeatures } = useContext(SavedFeaturesContext)!

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
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
        <MenuItem onClick={wrapper(() => saveAsGeoJson(savedFeatures))}>To GeoJson</MenuItem>
        <MenuItem onClick={wrapper(() => saveAsKml(savedFeatures))}>To KML</MenuItem>
      </Menu>
    </div>
  )
}

export default TopMenu
