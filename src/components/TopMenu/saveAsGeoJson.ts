import FileSaver from "file-saver"
import JSZip from "jszip"

import { SavedFeaturesStateType } from "../../contexts/SavedFeaturesContext.ts"
import { GeoJsonCollection } from "../../data/types"

export const saveAsGeoJson = (savedFeatures: SavedFeaturesStateType) => {
  const zip = new JSZip()

  Object.entries(savedFeatures).map(([category, features]) => {
    const data: GeoJsonCollection = {
      type: "FeatureCollection",
      features: features,
    }

    zip.file(`${category}.geojson`, JSON.stringify(data))
  })

  zip.generateAsync({ type: "blob" }).then((blob) => {
    FileSaver.saveAs(blob, "trip_explorer_features.zip")
  })
}

// New function for saving a specific project's GeoJSON data
export const saveProjectAsGeoJson = (projectData: SavedFeaturesStateType, projectName: string) => {
  const zip = new JSZip()

  Object.entries(projectData).map(([category, features]) => {
    const data: GeoJsonCollection = {
      type: "FeatureCollection",
      features: features,
    }
    // Include project name in the category file name for clarity if needed, or keep as is
    zip.file(`${projectName}_${category}.geojson`, JSON.stringify(data))
  })

  zip.generateAsync({ type: "blob" }).then((blob) => {
    FileSaver.saveAs(blob, `trip_explorer_project_${projectName}_geojson.zip`)
  })
}
