import { Drawer, Tabs, Tab, Box, List, ListItem, ListItemText, IconButton, Collapse } from "@mui/material"
import React, { useState } from "react"
import { MdMenu } from "react-icons/md"

import { SavedFeaturesState } from "../../contexts/SavedFeaturesContext.ts"
import { GeoJsonFeature } from "../../data/types"

interface SavedFeaturesDrawerProps {
  savedFeatures: SavedFeaturesState
  drawerOpen: boolean
  onClose: () => void
}

const SavedFeaturesDrawer: React.FC<SavedFeaturesDrawerProps> = ({
  savedFeatures,
  drawerOpen,
  onClose,
}) => {
  const [selectedTab, setSelectedTab] = useState<string>("all")
  const [selectedFeature, setSelectedFeature] = useState<GeoJsonFeature | null>(null)

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setSelectedTab(newValue)
    setSelectedFeature(null) // Reset feature when changing tabs
  }

  const excludedProperties = ["images", "style"]

  return (
    <>
      {/* Button to open the drawer */}
      <IconButton
        onClick={() => onClose()}
        style={{ position: "absolute", top: 10, left: 40, zIndex: 1000 }}
      >
        <MdMenu />
      </IconButton>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={onClose}
        sx={{
          width: { xs: "80%", sm: "50%", md: "30%" },
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: { xs: "80%", sm: "50%", md: "30%" },
            boxSizing: "border-box",
          },
        }}
      >
        <Box sx={{ display: "flex", height: "100%" }}>
          <Box sx={{ width: 150, bgcolor: "background.paper", borderRight: 1, borderColor: "divider" }}>
            <Tabs
              orientation="vertical"
              variant="scrollable"
              value={selectedTab}
              onChange={handleTabChange}
              aria-label="Saved Features Tabs"
              sx={{ height: "100%" }}
            >
              {Object.keys(savedFeatures).map((key) => (
                <Tab key={key} label={key} value={key} />
              ))}
            </Tabs>
          </Box>
          <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
            <List>
              {savedFeatures[selectedTab]?.map((feature, index) => (
                <React.Fragment key={index}>
                  <ListItem
                    button
                    onClick={() => setSelectedFeature((prev) => prev === feature ? null : feature)}
                  >
                    <ListItemText
                      primary={feature.properties?.name || "Unnamed Feature"}
                    />
                  </ListItem>
                  <Collapse in={selectedFeature === feature} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {Object.entries(feature.properties || {})
                        .filter(([key]) => !excludedProperties.includes(key)) // Exclude specified properties
                        .map(([key, value]) => (
                          <ListItem key={key} sx={{ pl: 4 }}>
                            <ListItemText primary={`${key}: ${value}`} />
                          </ListItem>
                        ))}
                    </List>
                  </Collapse>
                </React.Fragment>
              ))}
            </List>
          </Box>
        </Box>
      </Drawer>
    </>
  )
}

export default SavedFeaturesDrawer
