import FileSaver from "file-saver"
import JSZip from "jszip"

import { SavedFeaturesStateType } from "../../contexts/SavedFeaturesContext.ts"
import { getLinesFromDB, LineDefinition } from "../../utils/idbUtils.ts" // Added

export const saveAsBackup = async (savedFeatures: SavedFeaturesStateType) => {
  const zip = new JSZip()
  zip.file("trip_explorer_backup.json", JSON.stringify(savedFeatures, null, 2))

  const zipBlob = await zip.generateAsync({ type: "blob" })

  FileSaver.saveAs(zipBlob, "trip_explorer_backup.zip")
}

// New function for saving a specific project
export const saveProjectAsBackup = async (projectData: SavedFeaturesStateType, projectName: string) => {
  const zip = new JSZip()
  
  // Add POI data
  zip.file(`${projectName}_pois.json`, JSON.stringify(projectData, null, 2)) // Renamed for clarity

  // Fetch and add Line data
  try {
    const lines: LineDefinition[] = await getLinesFromDB(projectName)
    if (lines && lines.length > 0) {
      zip.file(`${projectName}_lines.json`, JSON.stringify(lines, null, 2))
    } else {
      // Create an empty array if no lines, to indicate lines were considered
      zip.file(`${projectName}_lines.json`, JSON.stringify([], null, 2))
    }
  } catch (error) {
    console.error("Error fetching lines for backup:", error)
    // Optionally, still create the zip but without lines, or handle error differently
    // For now, creating an empty lines file in case of error.
    zip.file(`${projectName}_lines.json`, JSON.stringify([], null, 2)) 
  }

  const zipBlob = await zip.generateAsync({ type: "blob" })

  FileSaver.saveAs(zipBlob, `trip_explorer_project_${projectName}_backup.zip`)
}
