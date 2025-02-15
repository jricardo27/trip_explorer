import { Menu, MenuItem } from "@mui/material"
import React, { useCallback } from "react"

import { DEFAULT_CATEGORY, NULL_TAB } from "../TabList/TabList.tsx"

interface CategoryContextMenuProps {
  contextMenu: { mouseX: number; mouseY: number } | null
  contextMenuTab: string | null
  handleClose: () => void
  moveCategory: (direction: "up" | "down") => void
  handleRenameCategory: (newName: string) => void
  handleAddCategory: () => void
  handleRemoveCategory: () => void
}

export const CategoryContextMenu: React.FC<CategoryContextMenuProps> = ({
  contextMenu,
  contextMenuTab,
  handleClose,
  moveCategory,
  handleRenameCategory,
  handleAddCategory,
  handleRemoveCategory,
}) => {
  const handleRename = useCallback(() => {
    if (!contextMenuTab || contextMenuTab === NULL_TAB) return

    const newName = prompt("Enter new name for category", contextMenuTab)
    if (newName && newName !== contextMenuTab) handleRenameCategory(newName)
  }, [contextMenuTab, handleRenameCategory])

  const wrapper = (handler: (event: React.MouseEvent) => void) => (event: React.MouseEvent) => {
    handler(event)
    handleClose()
  }

  const preventDefault = (event: React.MouseEvent) => {
    event.preventDefault()
    handleClose()
  }

  if (!contextMenuTab) return <></>

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
      {contextMenuTab && contextMenuTab !== DEFAULT_CATEGORY && contextMenuTab !== NULL_TAB ? (
        <>
          <MenuItem key="move-up" onClick={wrapper(() => moveCategory("up"))}>Move Up</MenuItem>
          <MenuItem key="move-down" onClick={wrapper(() => moveCategory("down"))}>Move Down</MenuItem>
          <MenuItem key="rename" onClick={wrapper(handleRename)}>Rename Category</MenuItem>
          <MenuItem key="remove" onClick={wrapper(handleRemoveCategory)}>Remove Category</MenuItem>
        </>
      ) : null}
      <MenuItem key="add-new" onClick={wrapper(handleAddCategory)}>Add New Category</MenuItem>
    </Menu>
  )
}
