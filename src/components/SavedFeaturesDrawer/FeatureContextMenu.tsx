import { Menu, MenuItem } from "@mui/material"
import React from "react"

import { selectionInfo } from "../../contexts/SavedFeaturesContext.ts"

interface FeatureContextMenuProps {
  contextMenu: { mouseX: number; mouseY: number } | null
  contextMenuFeature: selectionInfo | null
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

  const wrapper = (handler: (event: React.MouseEvent) => void) => {
    return (event: React.MouseEvent) => {
      handler(event)
      handleClose()
    }
  }

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
          {contextMenuFeature.category != "all" && <MenuItem onClick={wrapper(handleRemoveFromList)}>Remove from this list</MenuItem>}
          <MenuItem onClick={wrapper(handleRemoveCompletely)}>Remove</MenuItem>
        </>
      )}
    </Menu>
  )
}
