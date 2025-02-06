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
  const { setNodeRef } = useDroppable({
    id: "tabList",
  })

  return (
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
  )
}
