import { Menu, MenuItem } from "@mui/material"
import React from "react"

import { GeoJsonFeature } from "../../data/types"

interface FeatureContextMenuProps {
  contextMenu: { mouseX: number; mouseY: number } | null
  contextMenuFeature: GeoJsonFeature | null
  handleClose: () => void
  handleRemoveFromList: () => void
  handleRemoveCompletely: () => void
}

export const FeatureContextMenu: React.FC<FeatureContextMenuProps> = ({
  contextMenu,
  contextMenuFeature,
  handleClose,
  handleRemoveFromList,
  handleRemoveCompletely,
}) => {
  if (!contextMenuFeature) return <></>

  return (
    <Menu
      open={contextMenu !== null}
      onClose={handleClose}
      anchorReference="anchorPosition"
      anchorPosition={
        contextMenu !== null
          ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
          : undefined
      }
    >
      {contextMenuFeature && (
        <>
          <MenuItem onClick={handleRemoveFromList}>Remove from this list</MenuItem>
          <MenuItem onClick={handleRemoveCompletely}>Remove</MenuItem>
        </>
      )}
    </Menu>
  )
}
