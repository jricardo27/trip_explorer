import {
  Dialog,
  DialogTitle,
  DialogContent,
  Tabs,
  Tab,
  Box,
  Select,
  MenuItem,
  List,
  ListItem,
  FormControl,
  InputLabel,
  Checkbox,
  ListItemText,
} from "@mui/material"
import React, { useState } from "react" // Removed useEffect
import { usePoiSelection } from "../../contexts/PoiSelectionContext.ts" // Added import

import About from "./About.tsx"
import NextSteps from "./NextSteps.tsx"
import Technical from "./Technical.tsx"
import Tutorial from "./Tutorial.tsx"

interface WelcomeModalProps {
  open: boolean
  onClose: () => void
}

const WelcomeModal = ({ open, onClose }: WelcomeModalProps) => {
  const [tabValue, setTabValue] = useState(0)
  const {
    selectedRegion,
    setSelectedRegion,
    availableCategories,
    selectedCategories,
    setSelectedCategories,
    regions: regionsFromContext, // Renamed to avoid conflict with the old 'regions' const
  } = usePoiSelection()

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const handleRegionChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedRegion(event.target.value as string)
    // setSelectedCategories([]) // This is now handled by the provider's useEffect
  }

  const handleCategoryToggle = (fileName: string) => { // Parameter changed to fileName
    setSelectedCategories(
      selectedCategories.includes(fileName)
        ? selectedCategories.filter((c) => c !== fileName)
        : [...selectedCategories, fileName],
    )
  }

  // const regions = [ // This hardcoded array is no longer needed
  //   "westernAustralia",
  //   "newSouthWales",
  //   "victoria",
  //   "queensland",
  //   "southAustralia",
  //   "tasmania",
  //   "northernTerritory",
  //   "australianCapitalTerritory",
  //   "newZealand",
  // ]

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Welcome to Trip Explorer (by Ricardo Perez)</DialogTitle>
      <DialogContent>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
            <Tab label="About" />
            <Tab label="Select POIs & Categories" id="poi-selection-tab" /> {/* Added id */}
            <Tab label="Tutorial" />
            <Tab label="What's Next" />
            <Tab label="Technical Stuff" />
          </Tabs>
        </Box>
        {tabValue === 0 && <About />}
        {tabValue === 1 && (
          <Box sx={{ p: 3 }}>
            <FormControl fullWidth sx={{ mb: 2 }} id="region-select-dropdown"> {/* Added id */}
              <InputLabel id="region-select-label">Select Region</InputLabel>
              <Select
                labelId="region-select-label"
                value={selectedRegion}
                label="Select Region"
                onChange={handleRegionChange}
              >
                {regionsFromContext.length === 0 && (
                  <MenuItem value="" disabled>
                    Loading regions...
                  </MenuItem>
                )}
                {regionsFromContext.map((region) => (
                  <MenuItem key={region.id} value={region.id}>
                    {region.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <List sx={{ maxHeight: 200, overflow: "auto" }} id="category-list-container"> {/* Added id */}
              {availableCategories.map((categoryInfo) => ( // Iterate over categoryInfo objects
                <ListItem
                  key={categoryInfo.fileName} // Use fileName for key
                  dense
                  onClick={() => handleCategoryToggle(categoryInfo.fileName)} // Pass fileName to toggle
                  sx={{ cursor: "pointer" }}
                >
                  <Checkbox
                    edge="start"
                    checked={selectedCategories.includes(categoryInfo.fileName)} // Check against fileName
                    tabIndex={-1}
                    disableRipple
                  />
                  <ListItemText primary={categoryInfo.displayName} /> {/* Display displayName */}
                </ListItem>
              ))}
            </List>
          </Box>
        )}
        {tabValue === 2 && <Tutorial />}
        {tabValue === 3 && <NextSteps />}
        {tabValue === 4 && <Technical />}
      </DialogContent>
    </Dialog>
  )
}

export default WelcomeModal
