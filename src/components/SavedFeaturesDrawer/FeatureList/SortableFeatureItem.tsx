import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { ListItem, ListItemText, ListItemIcon, IconButton, ListItemSecondaryAction } from "@mui/material" // Added ListItemSecondaryAction
import React from "react" // Keep React import
import { MdDragIndicator, MdNearMe } from "react-icons/md" // Added MdNearMe

import { useLongPress } from "../../../hooks/useLongPress"
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
  navigateToCoordinates?: (coords: [number, number]) => void // Added navigateToCoordinates prop
  onClose?: () => void // Added onClose prop
}

export const SortableFeatureItem = ({
  feature,
  id,
  index,
  selectedTab,
  selectedFeature,
  setSelectedFeature,
  handleContextMenu,
  searchQuery,
  navigateToCoordinates, // Destructured navigateToCoordinates
  onClose, // Destructured onClose
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

              if (!navigateToCoordinates || !feature.geometry) {
                console.warn("Navigation prerequisites not met (missing navigateToCoordinates or geometry).");
                return;
              }

              const geometry = feature.geometry;
              let lngStr: string | number | undefined;
              let latStr: string | number | undefined;

              if (geometry.type === 'Point' && geometry.coordinates && geometry.coordinates.length === 2) {
                lngStr = geometry.coordinates[0];
                latStr = geometry.coordinates[1];
              } else if (geometry.type === 'LineString' && geometry.coordinates && geometry.coordinates[0] && geometry.coordinates[0].length === 2) {
                lngStr = geometry.coordinates[0][0];
                latStr = geometry.coordinates[0][1];
              } else if (geometry.type === 'Polygon' && geometry.coordinates && geometry.coordinates[0] && geometry.coordinates[0][0] && geometry.coordinates[0][0].length === 2) {
                lngStr = geometry.coordinates[0][0][0];
                latStr = geometry.coordinates[0][0][1];
              } else {
                console.warn(`Unsupported geometry type (${geometry.type}) or malformed coordinates for navigation for feature ID: ${feature.id}`);
                return;
              }

              if (lngStr !== undefined && latStr !== undefined) {
                const lng = parseFloat(String(lngStr));
                const lat = parseFloat(String(latStr));

                if (!isNaN(lng) && !isNaN(lat)) {
                  const leafletCoords: [number, number] = [lat, lng];
                  navigateToCoordinates(leafletCoords);
                  if (onClose) {
                    onClose();
                  }
                } else {
                  console.error(`Invalid coordinates after parsing for feature ID: ${feature.id}. Original values:`, { lngStr, latStr });
                }
              } else {
                console.error(`Coordinates could not be extracted for feature ID: ${feature.id}.`);
              }
            }}
          >
            <MdNearMe />
          </IconButton>
        </ListItemSecondaryAction>
      )}
    </ListItem>
  )
}
