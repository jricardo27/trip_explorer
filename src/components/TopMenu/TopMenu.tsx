import { Menu as MenuIcon } from "@mui/icons-material"
import { AppBar, Box, Button, Grid2, Menu, MenuItem, Toolbar, Tooltip, Typography } from "@mui/material"
import React, { useContext, useState } from "react"
import { FaDownload, FaUpload } from "react-icons/fa"
import { MdHelpOutline } from "react-icons/md"

import SavedFeaturesContext from "../../contexts/SavedFeaturesContext"
import WelcomeModal from "../WelcomeModal/WelcomeModal"

import { importBackup } from "./importBackup.ts"
import { saveAsBackup } from "./saveAsBackup.ts"
import { saveAsGeoJson } from "./saveAsGeoJson.ts"
import { saveAsKml } from "./saveAsKml.ts"

interface TopMenuProps {
  onMenuClick: () => void
}

const TopMenu: React.FC<TopMenuProps> = ({ onMenuClick }) => {
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

  const handleOpenWelcomeModal = () => setOpenWelcomeModal(true)
  const handleCloseWelcomeModal = () => setOpenWelcomeModal(false)

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Grid2 container spacing={2} sx={{ flexGrow: 1 }}>
            <Grid2 size={3}>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Trip Explorer
              </Typography>
            </Grid2>
            <Grid2 size={2}>
              <Tooltip title="Saved Features" aria-label="Saved Features">
                <Button onClick={onMenuClick} color="inherit" startIcon={<MenuIcon />} />
              </Tooltip>
            </Grid2>
            <Grid2 size={2}>
              <Tooltip title="Export" aria-label="Export">
                <Button
                  id="fade-button"
                  aria-controls={exportMenuIsOpen ? "fade-menu" : undefined}
                  aria-haspopup="true"
                  aria-expanded={exportMenuIsOpen ? "true" : undefined}
                  onClick={openExportMenu}
                  color="inherit"
                  startIcon={<FaDownload />}
                >
                </Button>
              </Tooltip>
              <Menu
                id="fade-menu"
                anchorEl={anchorEl}
                open={exportMenuIsOpen}
                onClose={closeExportMenu}
              >
                <MenuItem onClick={closeMenuAfterAction(() => saveAsGeoJson(savedFeatures))}>To GeoJson</MenuItem>
                <MenuItem onClick={closeMenuAfterAction(() => saveAsKml(savedFeatures))}>To KML</MenuItem>
                <MenuItem onClick={closeMenuAfterAction(() => saveAsBackup(savedFeatures))}>Export backup</MenuItem>
              </Menu>
            </Grid2>
            <Grid2 size={3}>
              <Tooltip title="Import" aria-label="Import">
                <Button
                  id="import-button"
                  aria-controls={importMenuIsOpen ? "import-menu" : undefined}
                  aria-haspopup="true"
                  aria-expanded={importMenuIsOpen ? "true" : undefined}
                  onClick={openImportMenu}
                  color="inherit"
                  startIcon={<FaUpload />}
                >
                </Button>
              </Tooltip>
              <Menu
                id="import-menu"
                anchorEl={importAnchorEl}
                open={importMenuIsOpen}
                onClose={closeImportMenu}
              >
                <MenuItem onClick={closeMenuAfterAction(() => { importBackup("override", setSavedFeatures) })}>Override existing POIs</MenuItem>
                <MenuItem onClick={closeMenuAfterAction(() => { importBackup("append", setSavedFeatures) })}>Append categories</MenuItem>
                <MenuItem onClick={closeMenuAfterAction(() => { importBackup("merge", setSavedFeatures) })}>Merge Categories</MenuItem>
              </Menu>
            </Grid2>
            <Grid2 size={2}>
              <Tooltip title="Help" aria-label="Help">
                <Button onClick={handleOpenWelcomeModal} color="inherit" startIcon={<MdHelpOutline />} />
              </Tooltip>
              <WelcomeModal open={openWelcomeModal} onClose={handleCloseWelcomeModal} />
            </Grid2>
          </Grid2>
        </Toolbar>
      </AppBar>
    </Box>
  )
}

export default TopMenu
