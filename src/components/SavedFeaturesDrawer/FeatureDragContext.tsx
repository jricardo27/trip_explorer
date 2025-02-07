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
import idxFeat from "../../utils/idxFeat.ts"

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

    if (over && active.id !== over.id) {
      const activeFeature = savedFeatures[selectedTab].find((f, index) => idxFeat(index, f) === active.id)

      if (activeFeature) {
        const sourceList = selectedTab
        let destinationList = selectedTab

        if (over.data?.current?.type === "tab") {
          destinationList = over.id
        }

        if (sourceList !== destinationList) {
          setSavedFeatures((prev: SavedFeaturesStateType) => {
            const newSavedFeatures = { ...prev }
            newSavedFeatures[sourceList] = newSavedFeatures[sourceList].filter((f, index) => {
              return idxFeat(index, f) !== active.id
            })
            newSavedFeatures[destinationList] = [...newSavedFeatures[destinationList], activeFeature]
            return newSavedFeatures
          })
        } else {
          const oldIndex = savedFeatures[sourceList].findIndex((f, index) => idxFeat(index, f) === active.id)
          const newIndex = savedFeatures[sourceList].findIndex((f, index) => idxFeat(index, f) === over.id)
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
              primary={savedFeatures[selectedTab].find((f, index) => idxFeat(index, f) === activeId)?.properties?.name || "Unnamed Feature"}
            />
          </ListItem>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
