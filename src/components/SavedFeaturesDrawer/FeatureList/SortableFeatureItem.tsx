import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { ListItem, ListItemText, ListItemIcon, IconButton, ListItemSecondaryAction } from "@mui/material" // Added ListItemSecondaryAction
import React from "react" // Keep React import
import { MdDragIndicator, MdNearMe } from "react-icons/md" // Added MdNearMe

import { useLongPress } from "../../../hooks/useLongPress"
import { selectionInfo } from "../../../contexts/SavedFeaturesContext"
import { GeoJsonFeature } from "../../../data/types"
import idxFeat, { idxSel } from "../../../utils/idxFeat"
// filterFeatures import removed as it's not used
import { getCoordinatesForNavigation } from "../../../utils/navigationUtils" // Import the new utility function

interface SortableFeatureItemProps {
  feature: GeoJsonFeature
  id: string
  index: number
  selectedTab: string
  selectedFeature: selectionInfo | null
  setSelectedFeature: (selection: selectionInfo | null) => void
  handleContextMenu: (event: React.MouseEvent | React.TouchEvent, selection: selectionInfo) => void
  // searchQuery: string // Removed searchQuery prop
  navigateToCoordinates?: (coords: [number, number]) => void
  onClose?: () => void
}

export const SortableFeatureItem = ({
  feature,
  id,
  index, // This will now be originalIndex
  selectedTab,
  selectedFeature,
  setSelectedFeature,
  handleContextMenu,
  // searchQuery, // Removed from destructuring
  navigateToCoordinates,
  onClose,
}: SortableFeatureItemProps) => {
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

  const isSelected = idxSel(selectedFeature) === idxFeat(index, feature) // index is originalIndex
  const selection: selectionInfo = { feature: feature, index: index, category: selectedTab } // index is originalIndex

  // Removed isVisible calculation and conditional rendering
  // const isVisible = searchQuery ? filterFeatures([feature], searchQuery).length > 0 : true
  // if (!isVisible) {
  //   return null;
  // }

  // Integrate useLongPress
  const longPressProps = useLongPress(
    (event) => {
      handleContextMenu(event, selection)
      // event.stopPropagation() is called by useLongPress if the long press is successful
    },
    500 // Duration for long press
  )

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
      button // Use standard 'button' prop for clickability
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
      {/* Conditional rendering of the navigation icon button */}
      {navigateToCoordinates && feature.geometry && (
        <ListItemSecondaryAction>
          <IconButton
            edge="end" // Standard for secondary actions
            aria-label="Navigate to POI"
            onClick={(event: React.MouseEvent) => {
              event.stopPropagation(); // Prevent ListItem's onClick

              if (!navigateToCoordinates) { // feature.geometry check is handled by getCoordinatesForNavigation
                console.warn("Navigation prerequisites not met (missing navigateToCoordinates).");
                return;
              }

              const leafletCoords = getCoordinatesForNavigation(feature);

              if (leafletCoords) {
                navigateToCoordinates(leafletCoords);
                if (onClose) {
                  onClose();
                }
              }
              // If leafletCoords is null, getCoordinatesForNavigation has already logged the error/warning.
            }}
          >
            <MdNearMe />
          </IconButton>
        </ListItemSecondaryAction>
      )}
    </ListItem>
  )
}
