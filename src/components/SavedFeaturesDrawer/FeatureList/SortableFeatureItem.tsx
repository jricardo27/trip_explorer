import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { ListItem, ListItemText, ListItemIcon, IconButton } from "@mui/material"
import React from "react"
import { MdDragIndicator } from "react-icons/md"

import { selectionInfo } from "../../../contexts/SavedFeaturesContext"
import { GeoJsonFeature } from "../../../data/types"
import idxFeat, { idxSel } from "../../../utils/idxFeat"

interface SortableFeatureItemProps {
  feature: GeoJsonFeature
  id: string
  index: number
  selectedTab: string
  selectedFeature: selectionInfo | null
  setSelectedFeature: (selection: selectionInfo | null) => void
  handleContextMenu: (event: React.MouseEvent, selection: selectionInfo) => void
}

export const SortableFeatureItem = ({ feature, id, index, selectedTab, selectedFeature, setSelectedFeature, handleContextMenu }: SortableFeatureItemProps) => {
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

  return (
    <ListItem
      ref={setNodeRef}
      style={style}
      onClick={(event: React.MouseEvent) => {
        event.stopPropagation()
        setSelectedFeature(isSelected ? null : selection)
      }}
      onContextMenu={(event) => {
        handleContextMenu(event, selection)
        event.stopPropagation()
      }}
      {...{ button: "true" }}
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
