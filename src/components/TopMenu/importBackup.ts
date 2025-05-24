import JSZip from "jszip";
import { v4 as uuidv4 } from "uuid"; // Import uuid

import { SavedFeaturesStateType } from "../../contexts/SavedFeaturesContext.ts";
import { LineDefinition } from "../../utils/idbUtils.ts"; // Import LineDefinition

export interface ImportedBackupData {
  pois?: SavedFeaturesStateType;
  lines?: LineDefinition[];
}

// Parses the uploaded zip file and extracts POI and Line data.
const handleFileImport = async (file: File): Promise<ImportedBackupData | null> => {
  try {
    const fileExtension = file.name.split(".").pop()?.toLowerCase();

    if (fileExtension === "zip") {
      const zip = new JSZip();
      const zipData = await zip.loadAsync(file);
      
      let pois: SavedFeaturesStateType | undefined = undefined;
      let lines: LineDefinition[] | undefined = undefined;

      // Find and parse POIs file (ends with _pois.json)
      const poisFile = Object.values(zipData.files).find((f) => f.name.endsWith("_pois.json"));
      if (poisFile) {
        const poisJsonData = await poisFile.async("string");
        pois = JSON.parse(poisJsonData) as SavedFeaturesStateType;
      } else {
        // Fallback for older backup format (ends with _backup.json or just .json)
        const oldPoisFile = Object.values(zipData.files).find(
            (f) => f.name.endsWith("_backup.json") || (Object.keys(zipData.files).length === 1 && f.name.endsWith(".json"))
        );
        if (oldPoisFile) {
            const poisJsonData = await oldPoisFile.async("string");
            pois = JSON.parse(poisJsonData) as SavedFeaturesStateType;
        } else {
            console.warn("POIs file not found in backup zip.");
        }
      }

      // Find and parse Lines file (ends with _lines.json)
      const linesFile = Object.values(zipData.files).find((f) => f.name.endsWith("_lines.json"));
      if (linesFile) {
        const linesJsonData = await linesFile.async("string");
        lines = JSON.parse(linesJsonData) as LineDefinition[];
        // It's good practice to ensure imported lines get new unique IDs if necessary,
        // especially if they might be merged into existing projects.
        // For now, we'll keep original IDs but this is a point for future enhancement.
        // Example: lines = lines.map(line => ({ ...line, id: uuidv4() }));
      } else {
        console.warn("Lines file not found in backup zip. Proceeding without lines.");
        lines = []; // Return empty array if lines file not found, to signify it was checked
      }
      
      if (pois || lines) { // Return data if at least one part was found
        return { pois, lines };
      } else {
        console.error("No valid POI or Line data found in the zip file.");
        return null;
      }

    } else if (fileExtension === "geojson") {
      // Handle direct GeoJSON import if needed (currently not part of backup/restore lines)
      console.log("GeoJSON import not supported for full backup/restore with lines.");
      return null;
    } else {
      console.error("Unsupported file type for backup import.");
      return null;
    }
  } catch (error) {
    console.error("Error processing backup file:", error);
    return null;
  }
};

// Exported function that triggers file input and uses callback to return parsed data.
export const importBackup = (callback: (data: ImportedBackupData | null) => void) => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".zip"; // Accepts only zip files now

  input.onchange = async (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      const file = target.files[0];
      const importedData = await handleFileImport(file);
      callback(importedData);
    } else {
      callback(null); // No file selected
    }
  };
  input.click();
};
