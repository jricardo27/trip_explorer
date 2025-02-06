import { Tabs } from "@mui/material"
import React from "react"

import DroppableTab from "./DroppableTab.tsx"

interface TabListProps {
  tabs: string[]
  selectedTab: string
  handleTabChange: (event: React.SyntheticEvent, newValue: string) => void
  handleTabContextMenu: (event: React.MouseEvent, tab: string) => void
}

export const TabList: React.FC<TabListProps> = ({ tabs, selectedTab, handleTabChange, handleTabContextMenu }) => {
  return (
    <Tabs
      orientation="vertical"
      variant="scrollable"
      value={selectedTab}
      onChange={handleTabChange}
      aria-label="Saved Features Tabs"
      sx={{ height: "100%" }}
    >
      {tabs.map((tab) => (
        <DroppableTab
          key={tab}
          tab={tab}
          value={tab}
          onContextMenu={(event) => handleTabContextMenu(event, tab)}
        />
      ))}
    </Tabs>
  )
}
