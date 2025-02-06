import { useDroppable } from "@dnd-kit/core"
import { Tabs, Tab } from "@mui/material"
import React from "react"

interface TabListProps {
  tabs: string[]
  selectedTab: string
  handleTabChange: (event: React.SyntheticEvent, newValue: string) => void
  handleTabContextMenu: (event: React.MouseEvent, tab: string) => void
}

export const TabList: React.FC<TabListProps> = ({ tabs, selectedTab, handleTabChange, handleTabContextMenu }) => {
  const { setNodeRef, node } = useDroppable({
    id: "tabList",
  })

  // Style to ensure the droppable area covers the entire tab list
  const tabListStyle = {
    height: "100%",
    width: "100%",
    position: "relative",
  }

  // Add some visual feedback for when a feature is over the tab list
  let style = {}
  if (node?.rect) {
    style = {
      border: "1px dashed #ccc",
      ...tabListStyle,
    }
  } else {
    style = tabListStyle
  }

  return (
    <div ref={setNodeRef} style={style}>
      <Tabs
        ref={setNodeRef}
        orientation="vertical"
        variant="scrollable"
        value={selectedTab}
        onChange={handleTabChange}
        aria-label="Saved Features Tabs"
        sx={{ height: "100%" }}
      >
        {tabs.map((tab) => (
          <Tab
            key={tab}
            label={tab}
            value={tab}
            onContextMenu={(event) => handleTabContextMenu(event, tab)}
          />
        ))}
      </Tabs>
    </div>
  )
}
