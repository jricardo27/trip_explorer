import { Grid2 as Grid } from "@mui/material"
import Button from "@mui/material/Button"
import Fade from "@mui/material/Fade"
import Menu from "@mui/material/Menu"
import MenuItem from "@mui/material/MenuItem"
import React, { useContext, useState } from "react"
import { MdHelpOutline } from "react-icons/md"

import SavedFeaturesContext from "../../../contexts/SavedFeaturesContext"
import WelcomeModal from "../../WelcomeModal/WelcomeModal"

import { saveAsGeoJson } from "./saveAsGeoJson"
import { saveAsKml } from "./saveAsKml"

const TopMenu = () => {
  const { savedFeatures } = useContext(SavedFeaturesContext)!

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [openWelcomeModal, setOpenWelcomeModal] = useState<boolean>(false)

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

  // Handlers for the WelcomeModal
  const handleOpenWelcomeModal = () => setOpenWelcomeModal(true)
  const handleCloseWelcomeModal = () => setOpenWelcomeModal(false)

  return (
    <Grid container spacing={3} sx={{ flexGrow: 1 }}>
      <Grid size={4}>
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
      </Grid>
      <Grid size={{ xs: 3, sm: 3, md: 2, lg: 2, xl: 2 }} offset="auto">
        <Button onClick={handleOpenWelcomeModal}>Help <MdHelpOutline /></Button>
        <WelcomeModal open={openWelcomeModal} onClose={handleCloseWelcomeModal} />
      </Grid>
    </Grid>
  )
}

export default TopMenu
