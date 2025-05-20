import { List, ListItem, ListItemText, Collapse, Button } from "@mui/material"
import React, { useEffect, useState } from "react"

import { SavedFeaturesStateType, selectionInfo } from "../../../contexts/SavedFeaturesContext"
import { GeoJsonFeature } from "../../../data/types"
import idxFeat, { idxSel } from "../../../utils/idxFeat"
import NoteEditor from "../../NoteEditor/NoteEditor"

import { SortableFeatureItem } from "./SortableFeatureItem"

interface FeatureListProps {
  features: GeoJsonFeature[]
  setSavedFeatures: {
    (newState: SavedFeaturesStateType): void
    (updater: (prev: SavedFeaturesStateType) => SavedFeaturesStateType): void
  }
  selectedTab: string
  selectedFeature: selectionInfo | null
  setSelectedFeature: (selection: selectionInfo | null) => void
  handleContextMenu: (event: React.MouseEvent | React.TouchEvent, selection: selectionInfo) => void // Updated for long press
  excludedProperties: string[]
  searchQuery: string // Added searchQuery prop
  navigateToCoordinates?: (coords: [number, number]) => void // Added navigateToCoordinates prop
  onClose?: () => void // Added onClose prop
}

export const FeatureList = ({
  features,
  setSavedFeatures,
  selectedTab,
  selectedFeature,
  setSelectedFeature,
  handleContextMenu,
  excludedProperties,
  searchQuery, // Destructure searchQuery
  navigateToCoordinates, // Destructure navigateToCoordinates
  onClose, // Destructure onClose
}: FeatureListProps) => {
  const [editorVisible, setEditorVisible] = useState(false)
  const [notes, setNotes] = useState("")

  const openCloseEditor = (feature: GeoJsonFeature) => {
    if (!editorVisible) {
      setNotes(feature.properties?.tripNotes || "")
      setEditorVisible(true)
    } else {
      setEditorVisible(false)
      setNotes("")
    }
  }

  const handleNotesChange = (content: string) => {
    setNotes(content)
  }

  const handleSaveNotes = () => {
    if (selectedFeature) {
      setSavedFeatures((prev) => {
        const newFeatures = [...prev[selectedTab]]
        const index = newFeatures.findIndex((f, index) => idxFeat(index, f) === idxSel(selectedFeature))
        if (index !== -1 && newFeatures[index].properties) {
          newFeatures[index].properties.tripNotes = notes
        }
        return { ...prev, [selectedTab]: newFeatures }
      })
    }
  }

  useEffect(() => {
    if (!selectedFeature && editorVisible) {
      setEditorVisible(false)
      setNotes("")
    }
  }, [editorVisible, selectedFeature, setNotes, setEditorVisible])

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
            searchQuery={searchQuery} // Pass searchQuery to SortableFeatureItem
          />
          <Collapse in={idxSel(selectedFeature) === idxFeat(index, feature)} timeout="auto" unmountOnExit>
            <ListItem sx={{ pl: 4 }}>
              <Button onClick={() => openCloseEditor(feature)}>Add/edit notes</Button>
            </ListItem>
            {/* Add "Go to on Map" button here */}
            {navigateToCoordinates && selectedFeature?.feature.geometry && (
              <ListItem sx={{ pl: 4 }}>
                <Button
                  onClick={() => {
                    if (!selectedFeature || !selectedFeature.feature.geometry || !navigateToCoordinates) {
                      return;
                    }
                    const geometry = selectedFeature.feature.geometry;
                    let rawCoordsAny: any[] | undefined; 

                    if (geometry.type === 'Point' && geometry.coordinates) {
                      rawCoordsAny = geometry.coordinates;
                    } else if (geometry.type === 'LineString' && geometry.coordinates && geometry.coordinates[0]) {
                      rawCoordsAny = geometry.coordinates[0];
                    } else if (geometry.type === 'Polygon' && geometry.coordinates && geometry.coordinates[0] && geometry.coordinates[0][0]) {
                      rawCoordsAny = geometry.coordinates[0][0];
                    } else {
                      console.warn("Unsupported geometry type or missing coordinates for navigation:", geometry.type);
                      return;
                    }

                    if (Array.isArray(rawCoordsAny) && rawCoordsAny.length === 2) {
                      const lng = parseFloat(rawCoordsAny[0]);
                      const lat = parseFloat(rawCoordsAny[1]);

                      if (!isNaN(lng) && !isNaN(lat)) {
                        const leafletCoords: [number, number] = [lat, lng];
                        navigateToCoordinates(leafletCoords);
                        if (onClose) {
                          onClose();
                        }
                      } else {
                        console.error("Invalid coordinates after parsing. Expected numbers, received:", rawCoordsAny);
                      }
                    } else {
                      console.error("Coordinates are missing, not an array, or not a pair:", rawCoordsAny);
                    }
                  }}
                >
                  Go to on Map
                </Button>
              </ListItem>
            )}
            {editorVisible && (
              <>
                <ListItem sx={{ pl: 4 }}>
                  <NoteEditor key={idxFeat(index, feature)} initialText={notes} onChange={handleNotesChange} />
                </ListItem>
                <ListItem sx={{ pl: 4 }}><Button onClick={handleSaveNotes}>Save notes</Button></ListItem>
              </>
            )}
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
