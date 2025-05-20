import { arrayMove } from "@dnd-kit/sortable"
import { useCallback } from "react"

import { DEFAULT_CATEGORY, SavedFeaturesStateType } from "../../../contexts/SavedFeaturesContext"

interface UseCategoryManagement {
  moveCategory: (direction: "up" | "down") => void
  handleRenameCategory: (newName: string) => void
  handleAddCategory: () => void
  handleRemoveCategory: () => void
}

export const useCategoryManagement = (
  setSavedFeatures: {
    (newState: SavedFeaturesStateType): void
    (updater: (prev: SavedFeaturesStateType) => SavedFeaturesStateType): void
  },
  setSelectedTab: (newState: string) => void,
  savedFeatures: SavedFeaturesStateType,
  contextMenuTab: string | null,
): UseCategoryManagement => {
  const moveCategory = useCallback((direction: "up" | "down") => {
    if (!contextMenuTab || contextMenuTab === DEFAULT_CATEGORY) return

    const keys = Object.keys(savedFeatures)
    const index = keys.indexOf(contextMenuTab)

    if (index === -1) return

    let newIndex
    if (direction === "up" && index > 1) {
      newIndex = index - 1
    } else if (direction === "down" && index < keys.length - 1) {
      newIndex = index + 1
    } else {
      return // Can't move further up/down
    }

    const newOrder = arrayMove(keys, index, newIndex)
    const newSavedFeatures = Object.fromEntries(newOrder.map((key) => [key, savedFeatures[key]]))
    setSavedFeatures(newSavedFeatures)
  }, [contextMenuTab, savedFeatures, setSavedFeatures])

const handleRenameCategory = useCallback((newName: string) => {
  // Initial Guard & Default Category Checks
  if (!contextMenuTab) {
    // This case should ideally not happen if context menu is triggered properly
    console.error("Rename category called without contextMenuTab");
    return;
  }
  if (contextMenuTab === DEFAULT_CATEGORY) {
    alert(`Cannot rename the default category "${DEFAULT_CATEGORY}".`);
    return;
  }
  if (newName === DEFAULT_CATEGORY) {
    alert(`Cannot rename category to "${DEFAULT_CATEGORY}". Please choose a different name.`);
    return;
  }

  // No-op Rename Check
  if (newName === contextMenuTab) {
    return; // It's the same name, do nothing
  }

  // Existing Name Check (Data Loss Prevention)
  // This check uses the `savedFeatures` state directly from the hook's scope.
  // It's done *before* calling `setSavedFeatures`.
  // The condition `newName !== contextMenuTab` is removed because the no-op check above ensures they are different.
  if (Object.keys(savedFeatures).includes(newName)) {
    alert(`Category "${newName}" already exists. Please choose a different name.`);
    return; // Prevent renaming
  }

  // If all checks pass, then we attempt to save and select.
  setSavedFeatures((prev: SavedFeaturesStateType) => {
    // This function now assumes the pre-checks for default category, no-op, and existing name have passed.
    const orderedKeys = Object.keys(prev);
    const newSavedFeatures: SavedFeaturesStateType = {};
    for (const key of orderedKeys) {
      if (key === contextMenuTab) {
        newSavedFeatures[newName] = prev[contextMenuTab];
      } else {
        newSavedFeatures[key] = prev[key];
      }
    }
    return newSavedFeatures;
  });

  setSelectedTab(newName); // Call if all checks passed and rename proceeded.

}, [contextMenuTab, savedFeatures, setSavedFeatures, setSelectedTab]);

  const handleAddCategory = useCallback(() => {
    let categoryName = prompt("Enter name for category")

    if (!categoryName || Object.keys(savedFeatures).includes(categoryName)) {
      categoryName = `Category_${Object.keys(savedFeatures).length}`
    }

    setSavedFeatures((prev: SavedFeaturesStateType) => ({
      ...prev,
      [categoryName]: [],
    }))
  }, [savedFeatures, setSavedFeatures])

  const handleRemoveCategory = useCallback(() => {
    if (contextMenuTab && contextMenuTab !== DEFAULT_CATEGORY) {
      setSavedFeatures((prev: SavedFeaturesStateType) => {
        const featuresToMove = prev[contextMenuTab]
        const newSavedFeatures = { ...prev }
        delete newSavedFeatures[contextMenuTab]
        newSavedFeatures[DEFAULT_CATEGORY] = [...newSavedFeatures[DEFAULT_CATEGORY], ...featuresToMove]
        return newSavedFeatures
      })

      const tabs = Object.keys(savedFeatures)
      const indexToDelete = tabs.indexOf(contextMenuTab)
      const previousTab = tabs[indexToDelete - 1]
      setSelectedTab(previousTab)
    }
  }, [contextMenuTab, setSavedFeatures, setSelectedTab, savedFeatures])

  return {
    moveCategory,
    handleRenameCategory,
    handleAddCategory,
    handleRemoveCategory,
  }
}
