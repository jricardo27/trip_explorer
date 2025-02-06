import { List, ListItem, ListItemText, Collapse } from "@mui/material"
import React from "react"

import { GeoJsonFeature } from "../../data/types"

import { SortableFeatureItem } from "./SortableFeatureItem"

interface FeatureListProps {
  features: GeoJsonFeature[]
  selectedFeature: GeoJsonFeature | null
  setSelectedFeature: (feature: GeoJsonFeature | null) => void
  handleContextMenu: (event: React.MouseEvent, feature: GeoJsonFeature) => void
  excludedProperties: string[]
}

export const FeatureList = ({ features, selectedFeature, setSelectedFeature, handleContextMenu, excludedProperties }: FeatureListProps) => {
  return (
    <List>
      {features.map((feature, index) => (
        <React.Fragment key={feature.properties?.id || index}>
          <SortableFeatureItem
            feature={feature}
            id={feature.properties?.id || index.toString()}
            selectedFeature={selectedFeature}
            setSelectedFeature={setSelectedFeature}
            handleContextMenu={handleContextMenu}
          />
          <Collapse in={selectedFeature === feature} timeout="auto" unmountOnExit>
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
