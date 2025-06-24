import { Menu, MenuItem } from "@mui/material"
import React, { useCallback } from "react"

import { DEFAULT_CATEGORY } from "../../../contexts/SavedFeaturesContext"
import { NULL_TAB } from "../TabList/TabList.tsx"

interface CategoryContextMenuProps {
  contextMenu: { mouseX: number; mouseY: number } | null
  contextMenuTab: string | null
  handleClose: () => void
  moveCategory: (direction: "up" | "down") => void
  handleRenameCategory: (newName: string) => void
  handleAddCategory: () => void
  handleRemoveCategory: () => void
  handlePlanRoute: (category: string) => void // Added for planning route
}

export const CategoryContextMenu: React.FC<CategoryContextMenuProps> = ({
  contextMenu,
  contextMenuTab,
  handleClose,
  moveCategory,
  handleRenameCategory,
  handleAddCategory,
  handleRemoveCategory,
  handlePlanRoute,
}) => {
  const handleRename = useCallback(() => {
    if (!contextMenuTab || contextMenuTab === NULL_TAB) return

    const newName = prompt("Enter new name for category", contextMenuTab)
    if (newName && newName !== contextMenuTab) handleRenameCategory(newName)
  }, [contextMenuTab, handleRenameCategory])

  // Wrapper to call the handler and then close the menu
  const wrapper = (handler: (event: React.MouseEvent) => void) => (event: React.MouseEvent) => {
    handler(event)
    handleClose()
  }

  // Prevents browser's context menu on the MUI Menu itself and closes it
  const preventDefaultAndClose = (event: React.MouseEvent) => {
    event.preventDefault()
    handleClose()
  }

  // If there's no specific tab context, don't render the menu.
  // This also implies that "Add New Category" is only available when a tab is context-clicked.
  if (!contextMenuTab) {
    return null // Rendering null is cleaner than an empty fragment
  }

  const menuItems: React.ReactNode[] = []

  // Conditional items for specific, modifiable categories
  if (contextMenuTab !== DEFAULT_CATEGORY && contextMenuTab !== NULL_TAB) {
    menuItems.push(
      <MenuItem key="move-up" onClick={wrapper(() => moveCategory("up"))}>
        Move Up
      </MenuItem>,
      <MenuItem key="move-down" onClick={wrapper(() => moveCategory("down"))}>
        Move Down
      </MenuItem>,
      <MenuItem key="rename" onClick={wrapper(handleRename)}>
        Rename Category
      </MenuItem>,
      <MenuItem key="remove" onClick={wrapper(handleRemoveCategory)}>
        Remove Category
      </MenuItem>,
      // Add Plan Route option for non-default categories
      <MenuItem key="plan-route" onClick={wrapper(() => handlePlanRoute(contextMenuTab))}>
        Plan Route
      </MenuItem>,
    )
  } else if (contextMenuTab === DEFAULT_CATEGORY) {
    // Add Plan Route option for the "all" category
    menuItems.push(
      <MenuItem key="plan-route-all" onClick={wrapper(() => handlePlanRoute(DEFAULT_CATEGORY))}>
        Plan Route
      </MenuItem>,
    )
  }

  // "Add New Category" is always an option if the menu is shown for a tab
  // Ensure it's not added twice if contextMenuTab is NULL_TAB (though current logic prevents menu for NULL_TAB)
  if (contextMenuTab !== NULL_TAB) {
    menuItems.push(
      <MenuItem key="add-new" onClick={wrapper(handleAddCategory)}>
        Add New Category
      </MenuItem>,
    )
  }


  return (
    <Menu
      open={contextMenu !== null}
      onClose={handleClose}
      onContextMenu={preventDefaultAndClose} // Handle right-click on the menu itself
      anchorReference="anchorPosition"
      anchorPosition={
        contextMenu !== null
          ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
          : undefined
      }
    >
      {menuItems}
    </Menu>
  )
}
