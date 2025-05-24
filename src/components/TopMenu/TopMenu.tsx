import { Menu as MenuIcon, VpnKey as VpnKeyIcon, Folder as FolderIcon } from "@mui/icons-material"
import { AppBar, Box, Button, Grid2, List, ListItem, ListItemButton, ListItemText, Menu, MenuItem, Toolbar, Tooltip, Typography, alpha, Divider } from "@mui/material"
import React, { useContext, useState, useCallback } from "react"
import { FaDownload, FaUpload } from "react-icons/fa"
import { MdHelpOutline, MdLocationOn } from "react-icons/md"
import { useNavigate, Link } from "react-router-dom"

// Context and Types
import SavedFeaturesContext, { DEFAULT_CATEGORY, SavedFeaturesStateType } from "../../contexts/SavedFeaturesContext"
import { TCurrentSearchResult } from "../../data/types"

// Components
import { ApiKeyModal } from "../ApiKeyModal"
import { GeocodingSearch } from "../GeocodingSearch"
import WelcomeModal from "../WelcomeModal/WelcomeModal"

// Utils and Helpers
import { clearLinesForProjectFromDB } from "../../utils/idbUtils"
import { importBackup, ImportedBackupData } from "./importBackup"
import { saveAsBackup, saveProjectAsBackup } from "./saveAsBackup"
import { saveAsGeoJson, saveProjectAsGeoJson } from "./saveAsGeoJson"
import { saveAsKml, saveProjectAsKml } from "./saveAsKml"

interface TopMenuProps {
  onMenuClick: () => void
  setCurrentSearchResult: (result: TCurrentSearchResult) => void
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

const TopMenu: React.FC<TopMenuProps> = ({ onMenuClick, setCurrentSearchResult }: TopMenuProps) => {
  const location = window.location.pathname
  const {
    savedFeatures,
    setSavedFeatures,
    currentProjectName,
    projectNames,
    setCurrentProjectName,
    createNewProject,
    addNewLine,
  } = useContext(SavedFeaturesContext)!
  const navigate = useNavigate()

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null) // Export menu
  const [openWelcomeModal, setOpenWelcomeModal] = useState<boolean>(false)
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState<boolean>(false)
  const [importAnchorEl, setImportAnchorEl] = useState<null | HTMLElement>(null)
  const [projectMenuAnchorEl, setProjectMenuAnchorEl] = useState<null | HTMLElement>(null)
  const [destinationAnchorEl, setDestinationAnchorEl] = useState<null | HTMLElement>(null)

  const importMenuIsOpen = Boolean(importAnchorEl)
  const exportMenuIsOpen = Boolean(anchorEl)
  const projectMenuIsOpen = Boolean(projectMenuAnchorEl)
  const destinationMenuIsOpen = Boolean(destinationAnchorEl)

  const openExportMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget)
  const closeExportMenu = () => setAnchorEl(null)

  const openImportMenu = (event: React.MouseEvent<HTMLElement>) => setImportAnchorEl(event.currentTarget)
  const closeImportMenu = () => setImportAnchorEl(null)

  const openProjectMenu = (event: React.MouseEvent<HTMLElement>) => setProjectMenuAnchorEl(event.currentTarget)
  const closeProjectMenu = () => setProjectMenuAnchorEl(null)

  const openDestinationMenu = (event: React.MouseEvent<HTMLElement>) => setDestinationAnchorEl(event.currentTarget)
  const closeDestinationMenu = () => setDestinationAnchorEl(null)

  const handleCreateNewProject = () => {
    const newProjName = prompt("Enter the name for the new project:")
    if (newProjName && newProjName.trim() !== "") {
      if (projectNames.includes(newProjName.trim())) {
        alert(`Project "${newProjName.trim()}" already exists.`)
      } else {
        createNewProject(newProjName.trim())
      }
    }
    closeProjectMenu()
  }

  const handleSwitchProject = (projectName: string) => {
    setCurrentProjectName(projectName)
    closeProjectMenu()
  }

  const closeMenuAfterAction = (handler: (...args: any[]) => void) => {
    return (...args: any[]) => {
      handler(...args)
      closeExportMenu()
      // Import, Project, and Destination menus are closed by their specific action handlers
    }
  }

  const handleOpenWelcomeModal = () => setOpenWelcomeModal(true)
  const handleCloseWelcomeModal = () => setOpenWelcomeModal(false)

  const handleOpenApiKeyModal = () => setApiKeyModalOpen(true)
  const handleCloseApiKeyModal = () => setApiKeyModalOpen(false)

  const handleDestinationChange = (_event: React.MouseEvent<HTMLElement>, newDestination: string) => {
    localStorage.removeItem("mapState")
    navigate(newDestination)
    closeDestinationMenu()
  }

  const handleFullImport = useCallback(async (importMode: "override" | "append" | "merge") => {
    if (!currentProjectName) {
      alert("Please select or create a project first.");
      return;
    }

    importBackup(async (data: ImportedBackupData | null) => {
      if (!data) {
        alert("Failed to read backup file, file was empty, or no relevant data found.");
        return;
      }

      let poisImported = false;
      let linesImported = false;
      let poiMessage = "No POI data found or processed in the backup.";
      let lineMessage = "No line data found or processed in the backup.";

      // Handle POIs
      if (data.pois) {
        const poiDataToImport = data.pois; // Ensure it's not undefined
        if (importMode === "override") {
          setSavedFeatures(poiDataToImport);
        } else if (importMode === "append") {
          setSavedFeatures((prevPois: SavedFeaturesStateType = { [DEFAULT_CATEGORY]: [] }) => {
            const newPois = { ...prevPois };
            for (const category in poiDataToImport) {
              if (newPois[category]) {
                newPois[category] = [...newPois[category], ...poiDataToImport[category]];
              } else {
                newPois[category] = poiDataToImport[category];
              }
            }
            return newPois;
          });
        } else if (importMode === "merge") {
          setSavedFeatures((prevPois: SavedFeaturesStateType = { [DEFAULT_CATEGORY]: [] }) => {
            const mergedPois = { ...prevPois };
            for (const category in poiDataToImport) {
              if (mergedPois[category]) {
                 const existingIds = new Set(mergedPois[category].map(f => f.properties?.id).filter(id => id));
                 const newFeatures = poiDataToImport[category].filter(f => !f.properties?.id || !existingIds.has(f.properties.id));
                 mergedPois[category] = [...mergedPois[category], ...newFeatures];
              } else {
                mergedPois[category] = poiDataToImport[category];
              }
            }
            return mergedPois;
          });
        }
        poisImported = true;
        poiMessage = "POIs imported successfully!";
      }

      // Handle Lines
      if (data.lines) { // data.lines could be an empty array
        if (importMode === "override") {
          try {
            await clearLinesForProjectFromDB(currentProjectName);
            // Lines state will be updated by addNewLine calls via context
          } catch (error) {
            console.error("Error clearing existing lines:", error);
            lineMessage = "Error clearing existing lines. New lines may be duplicates or add to existing ones.";
          }
        }

        if (data.lines.length > 0) {
            for (const line of data.lines) {
              try {
                // addNewLine from context handles ID generation and projectName association
                await addNewLine(line.name, line.poiIds);
              } catch (error) {
                console.error(`Error importing line "${line.name}":`, error);
              }
            }
            linesImported = true;
            lineMessage = "Lines imported successfully!";
        } else if (importMode === "override" || data.lines.length === 0) {
            // If override and lines array is empty, or if lines array is just empty (no new lines to add)
            linesImported = true; // Considered "handled" if no lines to add or old ones cleared.
            lineMessage = data.lines.length === 0 && importMode !== "override" ? "No new lines to import." : lineMessage;
        }
      }
      
      alert(`${poiMessage}\n${lineMessage}`);
      // The SavedFeaturesProvider's useEffect for currentProjectName and currentProjectLines (if any direct updates to DB occur)
      // and the fact that addNewLine updates context state should handle UI refresh.
    });
  }, [currentProjectName, setSavedFeatures, addNewLine]);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Grid2 container spacing={1} alignItems="center" sx={{ flexGrow: 1 }}>
            <Grid2 xs={12} sm={2} md={1.5}>
              <Tooltip title="Go back to destination selection" aria-label="Go back to destination selection">
                <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
                  <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    Trip Explorer
                  </Typography>
                </Link>
              </Tooltip>
            </Grid2>
            <Grid2 xs={12} sm={4} md={3.5}>
              <GeocodingSearch setCurrentSearchResult={setCurrentSearchResult} />
            </Grid2>
            <Grid2 xs={12} sm={6} md={7}>
              <Grid2 container spacing={1} justifyContent="flex-end" alignItems="center">
                <Grid2>
                  <Tooltip title="Saved Features" aria-label="Saved Features">
                    <Button onClick={onMenuClick} color="inherit" startIcon={<MenuIcon />} />
                  </Tooltip>
                </Grid2>
                <Grid2>
                  <Tooltip title="Export Current Project" aria-label="Export Current Project">
                    <Button
                      id="export-button"
                      aria-controls={exportMenuIsOpen ? "export-menu" : undefined}
                      aria-haspopup="true"
                      aria-expanded={exportMenuIsOpen ? "true" : undefined}
                      onClick={openExportMenu}
                      color="inherit"
                      startIcon={<FaDownload />}
                    />
                  </Tooltip>
                  <Menu
                    id="export-menu"
                    anchorEl={anchorEl}
                    open={exportMenuIsOpen}
                    onClose={closeExportMenu}
                  >
                    <MenuItem onClick={closeMenuAfterAction(() => saveProjectAsGeoJson(savedFeatures, currentProjectName || "Untitled Project"))}>Project to GeoJson</MenuItem>
                    <MenuItem onClick={closeMenuAfterAction(() => saveProjectAsKml(savedFeatures, currentProjectName || "Untitled Project"))}>Project to KML</MenuItem>
                    <MenuItem onClick={closeMenuAfterAction(() => saveProjectAsBackup(savedFeatures, currentProjectName || "Untitled Project"))}>Project backup</MenuItem>
                    <Divider />
                    <MenuItem disabled onClick={closeMenuAfterAction(() => saveAsGeoJson(savedFeatures["all"]))}>GeoJSON (Legacy 'all')</MenuItem>
                    <MenuItem disabled onClick={closeMenuAfterAction(() => saveAsKml(savedFeatures["all"]))}>KML (Legacy 'all')</MenuItem>
                    <MenuItem disabled onClick={closeMenuAfterAction(() => saveAsBackup(savedFeatures))}>Backup (Legacy)</MenuItem>
                  </Menu>
                </Grid2>
                <Grid2>
                  <Tooltip title="Import to Current Project" aria-label="Import to Current Project">
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
                    <MenuItem onClick={() => { handleFullImport("override"); closeImportMenu(); }}>Override current project</MenuItem>
                    <MenuItem onClick={() => { handleFullImport("append"); closeImportMenu(); }}>Append to current project</MenuItem>
                    <MenuItem onClick={() => { handleFullImport("merge"); closeImportMenu(); }}>Merge into current project</MenuItem>
                  </Menu>
                </Grid2>
                <Grid2>
                  <Tooltip title={`Current Project: ${currentProjectName}`} aria-label="Manage Projects">
                    <Button
                      id="project-button"
                      aria-controls={projectMenuIsOpen ? "project-menu" : undefined}
                      aria-haspopup="true"
                      aria-expanded={projectMenuIsOpen ? "true" : undefined}
                      onClick={openProjectMenu}
                      color="inherit"
                      startIcon={<FolderIcon />}
                      sx={{ textTransform: 'none', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    >
                      <Typography variant="body2" component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {currentProjectName || "Projects"}
                      </Typography>
                    </Button>
                  </Tooltip>
                  <Menu
                    id="project-menu"
                    anchorEl={projectMenuAnchorEl}
                    open={projectMenuIsOpen}
                    onClose={closeProjectMenu}
                  >
                    <MenuItem onClick={handleCreateNewProject}>Create New Project...</MenuItem>
                    <Divider />
                    {projectNames.length > 0 ? projectNames.map((name) => (
                      <MenuItem
                        key={name}
                        selected={name === currentProjectName}
                        onClick={() => handleSwitchProject(name)}
                      >
                        {name}
                      </MenuItem>
                    )) : <MenuItem disabled>No projects yet. Create one!</MenuItem>}
                  </Menu>
                </Grid2>
                <Grid2>
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
                <Grid2>
                  <Tooltip title="Help" aria-label="Help">
                    <Button onClick={handleOpenWelcomeModal} color="inherit" startIcon={<MdHelpOutline />} />
                  </Tooltip>
                  <WelcomeModal open={openWelcomeModal} onClose={handleCloseWelcomeModal} />
                </Grid2>
                <Grid2>
                  <Tooltip title="Set API Key" aria-label="Set API Key">
                    <Button onClick={handleOpenApiKeyModal} color="inherit" startIcon={<VpnKeyIcon />} />
                  </Tooltip>
                  <ApiKeyModal open={apiKeyModalOpen} onClose={handleCloseApiKeyModal} />
                </Grid2>
              </Grid2>
            </Grid2>
          </Grid2>
        </Toolbar>
      </AppBar>
    </Box>
  )
}

export default TopMenu
