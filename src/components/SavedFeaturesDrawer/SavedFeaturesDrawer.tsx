import {
  Drawer,
  Box,
  TextField,
  useTheme,
  useMediaQuery,
} from "@mui/material"
import React, { useState, useContext, useCallback, useEffect, useMemo } from "react" // Added useMemo

import SavedFeaturesContext, { DEFAULT_CATEGORY } from "../../contexts/SavedFeaturesContext"

import { CategoryContextMenu } from "./ContextMenu/CategoryContextMenu"
import { FeatureContextMenu } from "./ContextMenu/FeatureContextMenu"
import { FeatureDragContext } from "./FeatureList/FeatureDragContext"
import { FeatureList } from "./FeatureList/FeatureList"
import { useCategoryManagement } from "./hooks/useCategoryManagement"
import { useContextMenu } from "./hooks/useContextMenu"
import { useFeatureManagement } from "./hooks/useFeatureManagement"
import { useFeatureSelection } from "./hooks/useFeatureSelection"
import { TabList } from "./TabList/TabList"

interface SavedFeaturesDrawerProps {
  drawerOpen: boolean
  onClose: () => void
  setCurrentCategory?: (newState: string) => void
  navigateToCoordinates?: (coords: [number, number]) => void // Added navigateToCoordinates prop
}

const excludedProperties = ["id", "images", "style"] as const

const SavedFeaturesDrawer: React.FC<SavedFeaturesDrawerProps> = ({
  drawerOpen,
  onClose,
  setCurrentCategory,
  navigateToCoordinates, // Destructured navigateToCoordinates
}) => {
  const [selectedTab, setSelectedTab] = useState<string>(DEFAULT_CATEGORY)
  const [searchQuery, setSearchQuery] = useState<string>("")

  const { savedFeatures, setSavedFeatures, removeFeature } = useContext(SavedFeaturesContext)!
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

  // Create itemsWithOriginalIndex
  const itemsWithOriginalIndex = useMemo(() => {
    return (savedFeatures[selectedTab] || []).map((feature, index) => ({
      feature,
      originalIndex: index,
    }));
  }, [savedFeatures, selectedTab]);

  // Create filteredItems
  const filteredItems = useMemo(() => {
    if (!searchQuery) {
      return itemsWithOriginalIndex;
    }
    const query = searchQuery.toLowerCase();
    return itemsWithOriginalIndex.filter(item => {
      const feature = item.feature; // Access the feature for filtering
      const nameMatch = feature.properties?.name &&
        typeof feature.properties.name === 'string' &&
        feature.properties.name.toLowerCase().includes(query);
      const descriptionMatch = feature.properties?.description &&
        typeof feature.properties.description === 'string' &&
        feature.properties.description.toLowerCase().includes(query);
      return nameMatch || descriptionMatch;
    });
  }, [itemsWithOriginalIndex, searchQuery]);

  // Dead code related to currentFeatures and filteredFeatures has been removed.

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
                items={filteredItems} // New prop
                // features and searchQuery props removed
                setSavedFeatures={setSavedFeatures}
                selectedTab={selectedTab}
                selectedFeature={selectedFeature}
                setSelectedFeature={setSelectedFeature}
                handleContextMenu={handleContextMenu}
                excludedProperties={Array.from(excludedProperties)}
                navigateToCoordinates={navigateToCoordinates}
                onClose={onClose}
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
