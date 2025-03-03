import { Menu as MenuIcon } from "@mui/icons-material"
import { Grid2 as Grid } from "@mui/material"
import Button from "@mui/material/Button"
import Fade from "@mui/material/Fade"
import Menu from "@mui/material/Menu"
import MenuItem from "@mui/material/MenuItem"
import React, { useContext, useState } from "react"
import { MdHelpOutline } from "react-icons/md"

import SavedFeaturesContext from "../../../contexts/SavedFeaturesContext"
import WelcomeModal from "../../WelcomeModal/WelcomeModal"

import { importBackup } from "./importBackup"
import { saveAsBackup } from "./saveAsBackup"
import { saveAsGeoJson } from "./saveAsGeoJson"
import { saveAsKml } from "./saveAsKml"

const TopMenu = () => {
  const { savedFeatures, setSavedFeatures } = useContext(SavedFeaturesContext)!

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [openWelcomeModal, setOpenWelcomeModal] = useState<boolean>(false)
  const [importAnchorEl, setImportAnchorEl] = useState<null | HTMLElement>(null)
  const importMenuIsOpen = Boolean(importAnchorEl)
  const exportMenuIsOpen = Boolean(anchorEl)

  const openExportMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const closeExportMenu = () => {
    setAnchorEl(null)
  }

  const openImportMenu = (event: React.MouseEvent<HTMLElement>) => {
    setImportAnchorEl(event.currentTarget)
  }

  const closeImportMenu = () => {
    setImportAnchorEl(null)
  }

  const closeMenuAfterAction = (handler: (event: React.MouseEvent) => void) => {
    return (event: React.MouseEvent) => {
      handler(event)
      closeExportMenu()
      closeImportMenu()
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
          aria-controls={exportMenuIsOpen ? "fade-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={exportMenuIsOpen ? "true" : undefined}
          onClick={openExportMenu}
        >
          Export
        </Button>
        <Menu
          id="fade-menu"
          MenuListProps={{
            "aria-labelledby": "fade-button",
          }}
          anchorEl={anchorEl}
          open={exportMenuIsOpen}
          onClose={closeExportMenu}
          TransitionComponent={Fade}
        >
          <MenuItem onClick={closeMenuAfterAction(() => saveAsGeoJson(savedFeatures))}>To GeoJson</MenuItem>
          <MenuItem onClick={closeMenuAfterAction(() => saveAsKml(savedFeatures))}>To KML</MenuItem>
          <MenuItem onClick={closeMenuAfterAction(() => saveAsBackup(savedFeatures))}>Export backup</MenuItem>
        </Menu>
      </Grid>
      <Grid size={4}>
        <Button
          id="import-button"
          aria-controls={importMenuIsOpen ? "import-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={importMenuIsOpen ? "true" : undefined}
          onClick={openImportMenu}
        >
          Import <MenuIcon />
        </Button>
        <Menu
          id="import-menu"
          anchorEl={importAnchorEl}
          open={importMenuIsOpen}
          onClose={closeImportMenu}
          MenuListProps={{
            "aria-labelledby": "import-button",
          }}
        >
          <MenuItem onClick={closeMenuAfterAction(() => { importBackup("override", setSavedFeatures) })}>Override existing POIs</MenuItem>
          <MenuItem onClick={closeMenuAfterAction(() => { importBackup("append", setSavedFeatures) })}>Append categories</MenuItem>
          <MenuItem onClick={closeMenuAfterAction(() => { importBackup("merge", setSavedFeatures) })}>Merge Categories</MenuItem>
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
