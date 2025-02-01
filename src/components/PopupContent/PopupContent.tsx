import { Tabs, Tab, Box, Typography } from "@mui/material"
import React, { useState } from "react"
import ImageGallery from "react-image-gallery"

import "react-image-gallery/styles/css/image-gallery.css"
import { GeoJsonFeature } from "../../data/types"

import styles from "./PopupContent.module.css"

interface PopupContentProps {
  feature: GeoJsonFeature
}

const PopupContent = ({ feature }: PopupContentProps): React.ReactNode => {
  const [tabValue, setTabValue] = useState(0)

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const tabMapping = {
    General: ["name", { key: "description", className: styles.scrollableContent }],
  }

  // Extract images for the slideshow
  const images = feature.properties.images
    ? feature.properties.images.map((entry) => {
        const url = typeof entry === "string" ? entry : entry.src
        const title = typeof entry == "string" ? "" : entry.title

        return {
          original: url,
          thumbnail: url,
          originalTitle: title,
          thumbnailTitle: title,
        }
      })
    : []

  return (
    <div className={styles.popupContent}>
      <div className={styles.tabsContainer}>
        {/* Tabs for properties */}
        <Tabs value={tabValue} onChange={handleTabChange}>
          {Object.keys(tabMapping).map((tabName) => (
            <Tab key={tabName} label={tabName} />
          ))}
        </Tabs>

        {/* Tab content */}
        {Object.entries(tabMapping).map(([tabName, tabKeys], index) => (
          <div
            key={tabName}
            role="tabpanel"
            hidden={tabValue !== index}
            id={`tabpanel-${index}`}
          >
            {tabValue === index && (
              <Box sx={{ p: 3 }}>
                {tabKeys.map((entry) => {
                  const key = typeof entry === "string" ? entry : entry.key
                  const className = typeof entry === "string" ? "" : entry.className
                  let value = feature.properties[key]

                  if (typeof value === "object" && value !== null) {
                    value = <pre>{JSON.stringify(value, null, 2)}</pre>
                  }

                  return (
                    <div key={key} style={{ marginBottom: "16px" }}>
                      <Typography variant="subtitle1">
                        <strong>{key}:</strong>
                        {className === "" && (<span>{" "}{value}</span>)}
                      </Typography>
                      {className && <div className={className}><Typography>{value}</Typography></div>}
                    </div>
                  )
                })}
              </Box>
            )}
          </div>
        ))}
      </div>

      {/* Image slideshow */}
      {images.length > 0 && (
        <div className={styles.imagesContainer}>
          <ImageGallery items={images} originalHeight="200" />
        </div>
      )}
    </div>
  )
}

export default PopupContent
