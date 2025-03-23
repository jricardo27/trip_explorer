import { Menu as MenuIcon } from "@mui/icons-material"
import { AppBar, Box, Button, Grid2, List, ListItem, ListItemButton, ListItemText, Menu, MenuItem, Toolbar, Tooltip, Typography, alpha } from "@mui/material"
import React, { useContext, useState } from "react"
import { FaDownload, FaUpload } from "react-icons/fa"
import { MdHelpOutline, MdLocationOn } from "react-icons/md"
import { useNavigate } from "react-router-dom"

import SavedFeaturesContext from "../../contexts/SavedFeaturesContext"
import WelcomeModal from "../WelcomeModal/WelcomeModal"

import { importBackup } from "./importBackup.ts"
import { saveAsBackup } from "./saveAsBackup.ts"
import { saveAsGeoJson } from "./saveAsGeoJson.ts"
import { saveAsKml } from "./saveAsKml.ts"

interface TopMenuProps {
  onMenuClick: () => void
}

const destinations = [
  {
    label: "Australia",
    children: [
      { path: "/australianCapitalTerritory", label: "Australian Capital Territory" },
      { path: "/newSouthWales", label: "New South Wales" },
      { path: "/northernTerritory", label: "Northern Territory" },
      { path: "/queensland", label: "Queensland" },
      { path: "/victoria", label: "Victoria" },
      { path: "/southAustralia", label: "South Australia" },
      { path: "/tasmania", label: "Tasmania" },
      { path: "/westernAustralia", label: "Western Australia" },
    ],
  },
  {
    label: "New Zealand",
    children: [{ path: "/newZealand", label: "New Zealand" }],
  },
]

const TopMenu: React.FC<TopMenuProps> = ({ onMenuClick }) => {
  const location = window.location.pathname
  const { savedFeatures, setSavedFeatures } = useContext(SavedFeaturesContext)!
  const navigate = useNavigate()

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [openWelcomeModal, setOpenWelcomeModal] = useState<boolean>(false)
  const [importAnchorEl, setImportAnchorEl] = useState<null | HTMLElement>(null)
  const [destinationAnchorEl, setDestinationAnchorEl] = useState<null | HTMLElement>(null)
  const importMenuIsOpen = Boolean(importAnchorEl)
  const exportMenuIsOpen = Boolean(anchorEl)
  const destinationMenuIsOpen = Boolean(destinationAnchorEl)

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

  const openDestinationMenu = (event: React.MouseEvent<HTMLElement>) => {
    setDestinationAnchorEl(event.currentTarget)
  }

  const closeDestinationMenu = () => {
    setDestinationAnchorEl(null)
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

  const handleDestinationChange = (_event: React.MouseEvent<HTMLElement>, newDestination: string) => {
    navigate(newDestination)
    closeDestinationMenu()
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Grid2 container spacing={2} sx={{ flexGrow: 1 }}>
            <Grid2 size={2}>
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
                />
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
            <Grid2 size={2}>
              <Tooltip title="Import" aria-label="Import">
                <Button
                  id="import-button"
                  aria-controls={importMenuIsOpen ? "import-menu" : undefined}
                  aria-haspopup="true"
                  aria-expanded={importMenuIsOpen ? "true" : undefined}
                  onClick={openImportMenu}
                  color="inherit"
                  startIcon={<FaUpload />}
                />
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
              <Tooltip title="Destinations" aria-label="Destinations">
                <Button
                  id="destination-button"
                  aria-controls={destinationMenuIsOpen ? "destination-menu" : undefined}
                  aria-haspopup="true"
                  aria-expanded={destinationMenuIsOpen ? "true" : undefined}
                  onClick={openDestinationMenu}
                  color="inherit"
                  startIcon={<MdLocationOn />}
                />
              </Tooltip>
              <Menu
                id="destination-menu"
                anchorEl={destinationAnchorEl}
                open={destinationMenuIsOpen}
                onClose={closeDestinationMenu}
              >
                {destinations.map((region) => (
                  <Box key={region.label}>
                    <MenuItem disabled>{region.label}</MenuItem>
                    <List disablePadding>
                      {region.children.map((dest) => (
                        <ListItem key={dest.path} disablePadding>
                          <ListItemButton
                            onClick={(event) => handleDestinationChange(event, dest.path)}
                            sx={{
                              pl: 4,
                              bgcolor: location === dest.path ? (theme) => alpha(theme.palette.primary.main, 0.2) : "transparent",
                            }}
                          >
                            <ListItemText primary={dest.label} />
                          </ListItemButton>
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                ))}
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
