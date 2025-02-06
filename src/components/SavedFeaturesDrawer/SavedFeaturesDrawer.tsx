import { arrayMove } from "@dnd-kit/sortable"
import {
  Drawer,
  Box,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material"
import React, { useState, useContext, useCallback } from "react"
import { MdMenu } from "react-icons/md"

import SavedFeaturesContext, { SavedFeaturesStateType } from "../../contexts/SavedFeaturesContext"
import { GeoJsonFeature } from "../../data/types"

import { CategoryContextMenu } from "./CategoryContextMenu"
import { FeatureContextMenu } from "./FeatureContextMenu"
import { FeatureDragContext } from "./FeatureDragContext"
import { FeatureList } from "./FeatureList"
import { TabList } from "./TabList"

interface SavedFeaturesDrawerProps {
  drawerOpen: boolean
  onClose: () => void
}

const excludedProperties = ["id", "images", "style"] as const

const SavedFeaturesDrawer: React.FC<SavedFeaturesDrawerProps> = ({ drawerOpen, onClose }) => {
  const { savedFeatures, setSavedFeatures } = useContext(SavedFeaturesContext)!
  const [selectedTab, setSelectedTab] = useState<string>("all")
  const [selectedFeature, setSelectedFeature] = useState<GeoJsonFeature | null>(null)
  const [contextMenu, setContextMenu] = useState<{ mouseX: number; mouseY: number } | null>(null)
  const [contextMenuTab, setContextMenuTab] = useState<string | null>(null)
  const [contextMenuFeature, setContextMenuFeature] = useState<GeoJsonFeature | null>(null)
  const theme = useTheme()
  const isSm = useMediaQuery(theme.breakpoints.up("sm"))
  const isMd = useMediaQuery(theme.breakpoints.up("md"))

  const drawerWidth = isMd ? "30%" : isSm ? "50%" : "80%"

  const handleTabChange = useCallback((event: React.SyntheticEvent, newValue: string) => {
    setSelectedTab(newValue)
    setSelectedFeature(null)
  }, [])

  const handleContextMenu = useCallback((event: React.MouseEvent, feature: GeoJsonFeature) => {
    event.preventDefault()
    setContextMenu({
      mouseX: event.clientX + 2,
      mouseY: event.clientY - 6,
    })
    setContextMenuFeature(feature)
    setContextMenuTab(null)
  }, [])

  const handleTabContextMenu = useCallback((event: React.MouseEvent, tab: string) => {
    event.preventDefault()
    setContextMenuTab(tab)
    setContextMenuFeature(null)
    setContextMenu({
      mouseX: event.clientX + 2,
      mouseY: event.clientY - 6,
    })
  }, [])

  const handleClose = useCallback(() => {
    setContextMenu(null)
    setContextMenuTab(null)
  }, [])

  const moveCategory = useCallback((direction: "up" | "down") => {
    if (!contextMenuTab || contextMenuTab === "all") return

    const keys = Object.keys(savedFeatures)
    const index = keys.indexOf(contextMenuTab)

    if (index === -1) return

    let newIndex
    if (direction === "up" && index > 0) {
      newIndex = index - 1
    } else if (direction === "down" && index < keys.length - 1) {
      newIndex = index + 1
    } else {
      return // Can't move further up/down
    }

    const newOrder = arrayMove(keys, index, newIndex)
    const newSavedFeatures = Object.fromEntries(newOrder.map((key) => [key, savedFeatures[key]]))
    setSavedFeatures(newSavedFeatures)

    // If the moved tab was selected, update selectedTab to match the new position
    if (selectedTab === contextMenuTab) {
      setSelectedTab(newOrder[newIndex])
    }
  }, [contextMenuTab, savedFeatures, setSavedFeatures, selectedTab])

  const handleRenameCategory = useCallback((newName: string) => {
    if (contextMenuTab && contextMenuTab !== "all" && newName !== "all") {
      setSavedFeatures((prev: SavedFeaturesStateType) => {
        const newSavedFeatures = { ...prev }
        newSavedFeatures[newName] = newSavedFeatures[contextMenuTab]
        delete newSavedFeatures[contextMenuTab]
        const keys = Object.keys(newSavedFeatures)
        const index = keys.indexOf(contextMenuTab)

        if (index !== -1) {
          keys.splice(index, 1, newName)
          const updatedState = Object.fromEntries(keys.map((key) => [key, newSavedFeatures[key]]))

          // Update selectedTab if it matches the renamed tab
          if (selectedTab === contextMenuTab) {
            setSelectedTab(newName)
          }

          return updatedState
        }
        return newSavedFeatures
      })
    }
    handleClose()
  }, [contextMenuTab, selectedTab, setSavedFeatures, setSelectedTab, handleClose])

  const handleAddCategory = useCallback(() => {
    const newCategoryName = `Category_${Object.keys(savedFeatures).length}`
    setSavedFeatures((prev: SavedFeaturesStateType) => ({
      ...prev,
      [newCategoryName]: [],
    }))
    handleClose()
  }, [savedFeatures, setSavedFeatures, handleClose])

  const handleRemoveCategory = useCallback(() => {
    if (contextMenuTab && contextMenuTab !== "all") {
      setSavedFeatures((prev: SavedFeaturesStateType) => {
        const featuresToMove = prev[contextMenuTab]
        const newSavedFeatures = { ...prev }
        delete newSavedFeatures[contextMenuTab]
        newSavedFeatures.all = [...newSavedFeatures.all, ...featuresToMove]
        return newSavedFeatures
      })
    }
    handleClose()
  }, [contextMenuTab, setSavedFeatures, handleClose])

  const handleRemoveFromList = useCallback(() => {
    if (contextMenuFeature && selectedTab !== "all") {
      setSavedFeatures((prev: SavedFeaturesStateType) => {
        const newSavedFeatures = { ...prev }
        // Remove from current category
        newSavedFeatures[selectedTab] = newSavedFeatures[selectedTab].filter((f) => f.properties?.id !== contextMenuFeature.properties?.id)
        // Add to 'all' category if not already there
        if (!newSavedFeatures.all.some((f) => f.properties?.id === contextMenuFeature.properties?.id)) {
          newSavedFeatures.all = [...newSavedFeatures.all, contextMenuFeature]
        }

        setSelectedTab("all")

        return newSavedFeatures
      })
    }
    handleClose()
  }, [contextMenuFeature, selectedTab, setSavedFeatures, handleClose])

  const handleRemoveCompletely = useCallback(() => {
    if (contextMenuFeature) {
      setSavedFeatures((prev) => {
        const newSavedFeatures = { ...prev }
        // Remove from all categories
        for (const category in newSavedFeatures) {
          newSavedFeatures[category] = newSavedFeatures[category].filter((f) => f.properties?.id !== contextMenuFeature.properties?.id)
        }
        return newSavedFeatures
      })
    }
    handleClose()
  }, [contextMenuFeature, setSavedFeatures, handleClose])

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
          handleRemoveFromList={handleRemoveFromList}
          handleRemoveCompletely={handleRemoveCompletely}
        />
      </FeatureDragContext>
    </>
  )
}

export default SavedFeaturesDrawer
