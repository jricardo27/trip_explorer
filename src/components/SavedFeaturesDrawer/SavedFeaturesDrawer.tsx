import {
  Drawer,
  Box,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material"
import React, { useState, useContext, useCallback, useEffect } from "react"
import { MdMenu } from "react-icons/md"

import SavedFeaturesContext from "../../contexts/SavedFeaturesContext"

import { CategoryContextMenu } from "./CategoryContextMenu"
import { FeatureContextMenu } from "./FeatureContextMenu"
import { FeatureDragContext } from "./FeatureDragContext"
import { FeatureList } from "./FeatureList"
import { TabList } from "./TabList"
import TopMenu from "./TopMenu"
import { useCategoryManagement } from "./useCategoryManagement"
import { useContextMenu } from "./useContextMenu"
import { useFeatureManagement } from "./useFeatureManagement"
import { useFeatureSelection } from "./useFeatureSelection"

interface SavedFeaturesDrawerProps {
  drawerOpen: boolean
  onClose: () => void
  setCurrentCategory?: (newState: string) => void
}

const excludedProperties = ["id", "images", "style"] as const

const SavedFeaturesDrawer: React.FC<SavedFeaturesDrawerProps> = ({ drawerOpen, onClose, setCurrentCategory }) => {
  const [selectedTab, setSelectedTab] = useState<string>("all")

  const { savedFeatures, setSavedFeatures, removeFeature } = useContext(SavedFeaturesContext)!
  const { selectedFeature, setSelectedFeature } = useFeatureSelection()
  const { contextMenu, contextMenuTab, contextMenuFeature, handleContextMenu, handleTabContextMenu, handleClose } = useContextMenu()
  const { moveCategory, handleRenameCategory, handleAddCategory, handleRemoveCategory } = useCategoryManagement(
    setSavedFeatures, setSelectedTab, savedFeatures, contextMenuTab)
  const { handleDuplicate, handleRemoveFromList, handleRemoveCompletely } = useFeatureManagement(
    setSavedFeatures, selectedTab, contextMenuFeature, removeFeature)

  const theme = useTheme()
  const isSm = useMediaQuery(theme.breakpoints.up("sm"))
  const isMd = useMediaQuery(theme.breakpoints.up("md"))

  const drawerWidth = isMd ? "30%" : isSm ? "50%" : "80%"

  const handleTabChange = useCallback((_event: React.SyntheticEvent, newValue: string) => {
    setSelectedTab(newValue)
    setSelectedFeature(null)
  }, [setSelectedFeature])

  useEffect(() => {
    if (setCurrentCategory) {
      setCurrentCategory(selectedTab)
    }
  }, [selectedTab, setCurrentCategory])

  return (
    <>
      <IconButton
        onClick={onClose}
        style={{ position: "absolute", top: 10, left: 40, zIndex: 1000 }}
      >
        <MdMenu />
      </IconButton>
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
              boxSizing: "border-box",
            },
          }}
        >
          <Box sx={{ display: "flex", height: "50px", border: "1px solid #ccc" }}>
            <TopMenu savedFeatures={savedFeatures} />
          </Box>
          <Box sx={{ display: "flex", height: "100%" }}>
            <Box sx={{ width: 150, bgcolor: "background.paper", borderRight: 1, borderColor: "divider" }}>
              <TabList
                tabs={Object.keys(savedFeatures)}
                selectedTab={selectedTab}
                handleTabChange={handleTabChange}
                handleTabContextMenu={handleTabContextMenu}
              />
            </Box>
            <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
              <FeatureList
                features={savedFeatures[selectedTab] || []}
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
