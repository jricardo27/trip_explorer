import { Menu, MenuItem } from "@mui/material"
import React, { useCallback } from "react"

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
    const newName = prompt("Enter new name for category", contextMenuTab)
    if (newName && newName !== contextMenuTab) handleRenameCategory(newName)
  }, [contextMenuTab, handleRenameCategory])

  if (!contextMenuTab) return <></>

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
      {contextMenuTab && contextMenuTab !== "all" ? (
        <>
          <MenuItem onClick={() => moveCategory("up")}>Move Up</MenuItem>
          <MenuItem onClick={() => moveCategory("down")}>Move Down</MenuItem>
          <MenuItem onClick={handleRename}>Rename Category</MenuItem>
          <MenuItem onClick={handleRemoveCategory}>Remove Category</MenuItem>
        </>
      ) : null}
      <MenuItem onClick={handleAddCategory}>Add New Category</MenuItem>
    </Menu>
  )
}
