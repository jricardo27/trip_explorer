import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { ListItem, ListItemText, ListItemIcon, IconButton } from "@mui/material"
import React from "react" // Keep React import
import { MdDragIndicator } from "react-icons/md"

import { useLongPress } from "../../../hooks/useLongPress" // Import useLongPress
import { selectionInfo } from "../../../contexts/SavedFeaturesContext"
import { GeoJsonFeature } from "../../../data/types"
import idxFeat, { idxSel } from "../../../utils/idxFeat"
import { filterFeatures } from "../filterUtils" // Import filterFeatures

interface SortableFeatureItemProps {
  feature: GeoJsonFeature
  id: string
  index: number
  selectedTab: string
  selectedFeature: selectionInfo | null
  setSelectedFeature: (selection: selectionInfo | null) => void
  handleContextMenu: (event: React.MouseEvent | React.TouchEvent, selection: selectionInfo) => void
  searchQuery: string // Added searchQuery prop
}

export const SortableFeatureItem = ({ feature, id, index, selectedTab, selectedFeature, setSelectedFeature, handleContextMenu, searchQuery }: SortableFeatureItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    // Reduce opacity when dragging to indicate it's being moved
    opacity: isDragging ? 0.5 : 1,
    border: isDragging ? "dashed" : "",
  }

  const isSelected = idxSel(selectedFeature) === idxFeat(index, feature)
  const selection: selectionInfo = { feature: feature, index: index, category: selectedTab }

  // Determine visibility based on searchQuery
  const isVisible = searchQuery ? filterFeatures([feature], searchQuery).length > 0 : true

  // Integrate useLongPress
  const longPressProps = useLongPress(
    (event) => {
      handleContextMenu(event, selection)
      // event.stopPropagation() is called by useLongPress if the long press is successful
    },
    500 // Duration for long press
  )

  if (!isVisible) {
    return null // If not visible, render nothing
  }

  return (
    <ListItem
      ref={setNodeRef}
      style={style}
      onClick={(event: React.MouseEvent) => {
        event.stopPropagation() // Keep stopPropagation for regular clicks
        setSelectedFeature(isSelected ? null : selection)
      }}
      // Spread longPressProps here. This replaces the old onContextMenu.
      {...longPressProps}
      {...{ button: "true" }} // Ensure this is still applied correctly
    >
      <ListItemIcon>
        <IconButton
          edge="start"
          aria-label="drag"
          {...listeners}
          {...attributes}
          sx={{
            // Ensures the handle doesn't interfere with the item's click area
            cursor: "grab",
            "&:active": { cursor: "grabbing" },
          }}
        >
          <MdDragIndicator />
        </IconButton>
      </ListItemIcon>
      <ListItemText
        primary={feature.properties?.name || "Unnamed Feature"}
      />
    </ListItem>
  )
}
