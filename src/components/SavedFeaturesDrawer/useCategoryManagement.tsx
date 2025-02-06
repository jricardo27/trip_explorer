import { arrayMove } from "@dnd-kit/sortable"
import { useCallback } from "react"

import { SavedFeaturesStateType } from "../../contexts/SavedFeaturesContext"

interface UseCategoryManagement {
  moveCategory: (direction: "up" | "down") => void
  handleRenameCategory: (newName: string) => void
  handleAddCategory: () => void
  handleRemoveCategory: () => void
}

interface UseCategoryManagementProps {
  setSavedFeatures: (newState: SavedFeaturesStateType) => void
  savedFeatures: SavedFeaturesStateType
  contextMenuTab: string | null
}

export const useCategoryManagement = ({ setSavedFeatures, savedFeatures, contextMenuTab }: UseCategoryManagementProps): UseCategoryManagement => {
  const moveCategory = useCallback((direction: "up" | "down") => {
    if (!contextMenuTab || contextMenuTab === "all") return

    const keys = Object.keys(savedFeatures)
    const index = keys.indexOf(contextMenuTab)

    if (index === -1) return

    let newIndex
    if (direction === "up" && index > 0) {
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
    if (contextMenuTab && contextMenuTab !== "all" && newName !== "all") {
      setSavedFeatures((prev: SavedFeaturesStateType) => {
        const newSavedFeatures = { ...prev }
        newSavedFeatures[newName] = newSavedFeatures[contextMenuTab]
        delete newSavedFeatures[contextMenuTab]
        const keys = Object.keys(newSavedFeatures)
        const index = keys.indexOf(contextMenuTab)
        if (index !== -1) keys.splice(index, 1, newName)
        return Object.fromEntries(keys.map((key) => [key, newSavedFeatures[key]]))
      })
    }
  }, [contextMenuTab, setSavedFeatures])

  const handleAddCategory = useCallback(() => {
    const newCategoryName = `Category_${Object.keys(savedFeatures).length}`
    setSavedFeatures((prev: SavedFeaturesStateType) => ({
      ...prev,
      [newCategoryName]: [],
    }))
  }, [savedFeatures, setSavedFeatures])

  const handleRemoveCategory = useCallback(() => {
    if (contextMenuTab && contextMenuTab !== "all") {
      setSavedFeatures((prev: SavedFeaturesStateType) => {
        const featuresToMove = prev[contextMenuTab]
        const newSavedFeatures = { ...prev }
        delete newSavedFeatures[contextMenuTab]
        newSavedFeatures.all = [...newSavedFeatures.all, ...featuresToMove]
        return newSavedFeatures
      })
    }
  }, [contextMenuTab, setSavedFeatures])

  return {
    moveCategory,
    handleRenameCategory,
    handleAddCategory,
    handleRemoveCategory,
  }
}
