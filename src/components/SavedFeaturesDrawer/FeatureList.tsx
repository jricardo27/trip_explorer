import { List, ListItem, ListItemText, Collapse } from "@mui/material"
import React from "react"

import { selectionInfo } from "../../contexts/SavedFeaturesContext.ts"
import { GeoJsonFeature } from "../../data/types"
import idxFeat, { idxSel } from "../../utils/idxFeat.ts"

import { SortableFeatureItem } from "./SortableFeatureItem"

interface FeatureListProps {
  features: GeoJsonFeature[]
  selectedTab: string
  selectedFeature: selectionInfo | null
  setSelectedFeature: (selection: selectionInfo | null) => void
  handleContextMenu: (event: React.MouseEvent, selection: selectionInfo) => void
  excludedProperties: string[]
}

export const FeatureList = ({ features, selectedTab, selectedFeature, setSelectedFeature, handleContextMenu, excludedProperties }: FeatureListProps) => {
  return (
    <List>
      {features.map((feature, index) => (
        <React.Fragment key={idxFeat(index, feature)}>
          <SortableFeatureItem
            feature={feature}
            id={idxFeat(index, feature)}
            index={index}
            selectedTab={selectedTab}
            selectedFeature={selectedFeature}
            setSelectedFeature={setSelectedFeature}
            handleContextMenu={handleContextMenu}
          />
          <Collapse in={idxSel(selectedFeature) === idxFeat(index, feature)} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {Object.entries(feature.properties || {})
                .filter(([key]) => !excludedProperties.includes(key))
                .map(([key, value]) => (
                  <ListItem key={key} sx={{ pl: 4 }}>
                    <ListItemText primary={`${key}: ${value}`} />
                  </ListItem>
                ))}
            </List>
          </Collapse>
        </React.Fragment>
      ))}
    </List>
  )
}
