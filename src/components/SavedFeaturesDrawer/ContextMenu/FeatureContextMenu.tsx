import { Menu, MenuItem } from "@mui/material"
import React from "react"

import { selectionInfo } from "../../../contexts/SavedFeaturesContext"
import { DEFAULT_CATEGORY } from "../TabList/TabList"

interface FeatureContextMenuProps {
  contextMenu: { mouseX: number; mouseY: number } | null
  contextMenuFeature: selectionInfo | null
  handleClose: () => void
  handleDuplicate: () => void
  handleRemoveFromList: () => void
  handleRemoveCompletely: () => void
}

export const FeatureContextMenu: React.FC<FeatureContextMenuProps> = ({
  contextMenu,
  contextMenuFeature,
  handleClose,
  handleDuplicate,
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

  const preventDefault = (event: React.MouseEvent) => {
    event.preventDefault()
    handleClose()
  }

  return (
    <Menu
      open={contextMenu !== null}
      onClose={handleClose}
      onContextMenu={preventDefault}
      anchorReference="anchorPosition"
      anchorPosition={
        contextMenu !== null
          ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
          : undefined
      }
    >
      {contextMenuFeature && (
        <>
          <MenuItem onClick={wrapper(handleDuplicate)}>Duplicate</MenuItem>
          {contextMenuFeature.category != DEFAULT_CATEGORY && <MenuItem onClick={wrapper(handleRemoveFromList)}>Remove from this list</MenuItem>}
          <MenuItem onClick={wrapper(handleRemoveCompletely)}>Remove</MenuItem>
        </>
      )}
    </Menu>
  )
}
