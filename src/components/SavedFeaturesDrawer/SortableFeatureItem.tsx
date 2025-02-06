import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { ListItem, ListItemText, ListItemIcon, IconButton } from "@mui/material"
import React from "react"
import { MdDragIndicator } from "react-icons/md"

import { GeoJsonFeature } from "../../data/types"

interface SortableFeatureItemProps {
  feature: GeoJsonFeature
  id: string
  selectedFeature: GeoJsonFeature | null
  setSelectedFeature: (feature: GeoJsonFeature | null) => void
  handleContextMenu: (event: React.MouseEvent, feature: GeoJsonFeature) => void
}

export const SortableFeatureItem = ({ feature, id, selectedFeature, setSelectedFeature, handleContextMenu }: SortableFeatureItemProps) => {
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

  const isSelected = selectedFeature?.properties?.id === feature.properties?.id

  return (
    <ListItem
      ref={setNodeRef}
      style={style}
      button="true"
      onClick={(event) => {
        event.stopPropagation()
        setSelectedFeature(isSelected ? null : feature)
      }}
      onContextMenu={(event) => {
        handleContextMenu(event, feature)
        event.stopPropagation()
      }}
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
