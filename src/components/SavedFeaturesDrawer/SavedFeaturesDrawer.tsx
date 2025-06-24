import {
  Drawer,
  Box,
  TextField,
  useTheme,
  useMediaQuery,
} from "@mui/material"
import React, { useState, useContext, useCallback, useEffect, useMemo } from "react"

import SavedFeaturesContext, { DEFAULT_CATEGORY } from "../../contexts/SavedFeaturesContext"

import { createRouteGeoJson } from "../../utils/createRouteGeoJson" // Added for route planning
import { CategoryContextMenu } from "./ContextMenu/CategoryContextMenu"
import { FeatureContextMenu } from "./ContextMenu/FeatureContextMenu"
import { FeatureDragContext } from "./FeatureList/FeatureDragContext"
import { FeatureList } from "./FeatureList/FeatureList"
import { filterFeatures } from "./filterFeatures"
import { useCategoryManagement } from "./hooks/useCategoryManagement"
import { useContextMenu } from "./hooks/useContextMenu"
import { useFeatureManagement } from "./hooks/useFeatureManagement"
import { useFeatureSelection } from "./hooks/useFeatureSelection"
import { TabList } from "./TabList/TabList"

interface SavedFeaturesDrawerProps {
  drawerOpen: boolean
  onClose: () => void
  setCurrentCategory?: (newState: string) => void
}

const excludedProperties = ["id", "images", "style"] as const

const SavedFeaturesDrawer: React.FC<SavedFeaturesDrawerProps> = ({ drawerOpen, onClose, setCurrentCategory }) => {
  const [selectedTab, setSelectedTab] = useState<string>(DEFAULT_CATEGORY)
  const [searchQuery, setSearchQuery] = useState<string>("")

  const { savedFeatures, setSavedFeatures, removeFeature, setActiveRouteGeoJson, activeRouteGeoJson } = useContext(SavedFeaturesContext)! // Added activeRouteGeoJson
  const { selectedFeature, setSelectedFeature } = useFeatureSelection()
  const { contextMenu, contextMenuTab, contextMenuFeature, handleContextMenu, handleTabContextMenu, handleClose } = useContextMenu()
  const { moveCategory, handleRenameCategory, handleAddCategory, handleRemoveCategory } = useCategoryManagement(
    setSavedFeatures, setSelectedTab, savedFeatures, contextMenuTab)
  const { handleDuplicate, handleRemoveFromList, handleRemoveCompletely } = useFeatureManagement(
    setSavedFeatures, selectedTab, contextMenuFeature, removeFeature)

  const theme = useTheme()
  const isXs = useMediaQuery(theme.breakpoints.down("sm"))
  const isSm = useMediaQuery(theme.breakpoints.between("sm", "md"))
  const isMd = useMediaQuery(theme.breakpoints.between("md", "lg"))

  const drawerWidth = isMd ? "70%" : isSm ? "50%" : isXs ? "92%" : "50%"

  const handleTabChange = useCallback((_event: React.SyntheticEvent, newValue: string) => {
    setSelectedTab(newValue)
    setSelectedFeature(null)
  }, [setSelectedFeature])

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value)
  }

  useEffect(() => {
    if (setCurrentCategory) {
      setCurrentCategory(selectedTab)
    }
  }, [selectedTab, setCurrentCategory])

  const itemsWithOriginalIndex = useMemo(() => {
    return (savedFeatures[selectedTab] || []).map((feature, index) => ({
      feature,
      originalIndex: index,
    }))
  }, [savedFeatures, selectedTab])

  const filteredItems = useMemo(() => {
    return filterFeatures(itemsWithOriginalIndex, searchQuery)
  }, [itemsWithOriginalIndex, searchQuery])

  // Effect to clear the route if features change, to prevent stale routes
  // A more sophisticated approach would track which category the route is for
  // and only clear if that specific category's features change.
  useEffect(() => {
    if (activeRouteGeoJson) { // Only clear if there's an active route
      setActiveRouteGeoJson(null)
      // Optionally, notify user that route was cleared due to changes
      // console.log("Route cleared due to changes in saved features.")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedFeatures, setActiveRouteGeoJson]) // activeRouteGeoJson is included to prevent clearing if it was already null

  const handlePlanRoute = useCallback((category: string) => {
    const featuresToRoute = savedFeatures[category]
    if (featuresToRoute && featuresToRoute.length > 1) {
      const routeGeoJson = createRouteGeoJson(featuresToRoute)
      setActiveRouteGeoJson(routeGeoJson)
    } else {
      setActiveRouteGeoJson(null) // Clear route if not enough points
      // Optionally, provide user feedback (e.g., toast notification)
      alert("Need at least two points in a category to plan a route.")
    }
    handleClose() // Close context menu
  }, [savedFeatures, setActiveRouteGeoJson, handleClose])

  return (
    <>
      <FeatureDragContext savedFeatures={savedFeatures} selectedTab={selectedTab} setSavedFeatures={setSavedFeatures}>
        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={onClose}
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              marginTop: "64px",
              boxSizing: "border-box",
            },
          }}
        >
          <Box sx={{ display: "flex", height: "100%" }}>
            <Box sx={{ width: 150, bgcolor: "background.paper", borderRight: 1, borderColor: "divider" }}>
              <TabList
                tabs={Object.keys(savedFeatures)}
                selectedTab={selectedTab}
                handleTabChange={handleTabChange}
                handleTabContextMenu={handleTabContextMenu}
              />
            </Box>
            <Box sx={{ flexGrow: 1, overflowY: "auto", p: 2 }}>
              <TextField
                fullWidth
                label="Search Features"
                variant="outlined"
                value={searchQuery}
                onChange={handleSearchChange}
                sx={{ mb: 2 }}
              />
              <FeatureList
                items={filteredItems}
                setSavedFeatures={setSavedFeatures}
                selectedTab={selectedTab}
                selectedFeature={selectedFeature}
                setSelectedFeature={setSelectedFeature}
                handleContextMenu={handleContextMenu}
                excludedProperties={Array.from(excludedProperties)}
              />
            </Box>
          </Box>
        </Drawer>
        <CategoryContextMenu
          contextMenu={contextMenu}
          contextMenuTab={contextMenuTab}
          handleClose={handleClose}
          moveCategory={moveCategory}
          handleRenameCategory={handleRenameCategory}
          handleAddCategory={handleAddCategory}
          handleRemoveCategory={handleRemoveCategory}
          handlePlanRoute={handlePlanRoute} // Pass the new handler
        />
        <FeatureContextMenu
          contextMenu={contextMenu}
          contextMenuFeature={contextMenuFeature}
          handleClose={handleClose}
          handleDuplicate={handleDuplicate}
          handleRemoveFromList={handleRemoveFromList}
          handleRemoveCompletely={handleRemoveCompletely}
        />
      </FeatureDragContext>
    </>
  )
}

export default SavedFeaturesDrawer
