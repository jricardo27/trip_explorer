import { useDroppable } from "@dnd-kit/core"
import { Tab, TabProps } from "@mui/material"
import React from "react"

interface DroppableTabProps extends TabProps {
  tab: string
  onContextMenu: (event: React.MouseEvent) => void
}

const DroppableTab: React.FC<DroppableTabProps> = ({ tab, onContextMenu, value, ...otherProps }) => {
  const { setNodeRef, node } = useDroppable({
    id: tab, // Unique ID for each tab, which is the category name
    data: { category: tab, type: "tab" }, // Data to identify this as a tab and which tab it is
  })

  return (
    <Tab
      ref={setNodeRef}
      label={tab}
      value={value}
      onContextMenu={onContextMenu}
      sx={{
        border: (node as never)?.rect ? "1px dashed #ccc" : "none", // Visual feedback when draggable item is over
      }}
      {...otherProps}
    />
  )
}

export default DroppableTab
