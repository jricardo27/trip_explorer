import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core"
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import { ListItem, ListItemText } from "@mui/material"
import React, { useCallback, useState } from "react"

import { SavedFeaturesStateType } from "../../contexts/SavedFeaturesContext"
import { GeoJsonFeature } from "../../data/types"

interface FeatureDragContextProps {
  children: React.ReactNode
  savedFeatures: { [key: string]: GeoJsonFeature[] }
  selectedTab: string
  setSavedFeatures: (newState: SavedFeaturesStateType) => void
}

export const FeatureDragContext: React.FC<FeatureDragContextProps> = ({ children, savedFeatures, selectedTab, setSavedFeatures }) => {
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleDragStart = useCallback((event) => {
    setActiveId(event.active.id)
  }, [])

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event

    if (active.id !== over.id) {
      const activeFeature = savedFeatures[selectedTab].find((f) => f.properties?.id === active.id)

      if (activeFeature) {
        const sourceList = selectedTab
        let destinationList = selectedTab

        if (over.data?.current?.type === "tab") {
          destinationList = over.id
        } else {
          for (const [category, features] of Object.entries(savedFeatures)) {
            if (features.some((f) => f.properties?.id === over.id)) {
              destinationList = category
              break
            }
          }
        }

        if (sourceList !== destinationList) {
          setSavedFeatures((prev: SavedFeaturesStateType) => {
            const newSavedFeatures = { ...prev }
            newSavedFeatures[sourceList] = newSavedFeatures[sourceList].filter((f) => f.properties?.id !== activeFeature.properties?.id)
            newSavedFeatures[destinationList] = [...newSavedFeatures[destinationList], activeFeature]
            return newSavedFeatures
          })
        } else {
          const oldIndex = savedFeatures[sourceList].findIndex((f) => f.properties?.id === active.id)
          const newIndex = savedFeatures[sourceList].findIndex((f) => f.properties?.id === over.id)
          const newOrder = arrayMove(savedFeatures[sourceList], oldIndex, newIndex)
          setSavedFeatures((prev: SavedFeaturesStateType) => ({
            ...prev,
            [sourceList]: newOrder,
          }))
        }
      }
    }

    setActiveId(null)
  }, [savedFeatures, selectedTab, setSavedFeatures])

  const handleDragCancel = useCallback(() => {
    setActiveId(null)
  }, [])

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      {children}
      <DragOverlay>
        {activeId ? (
          <ListItem>
            <ListItemText
              primary={savedFeatures[selectedTab].find((f) => f.properties?.id === activeId)?.properties?.name || "Unnamed Feature"}
            />
          </ListItem>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
