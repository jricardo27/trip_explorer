import FileSaver from "file-saver"
import tokml from "geojson-to-kml"
import JSZip from "jszip"

import { SavedFeaturesStateType } from "../../contexts/SavedFeaturesContext.ts"
import { GeoJsonCollection, GeoJsonFeature, TCoordinateTuple } from "../../data/types" // Added TCoordinateTuple
import formatFeature from "../../utils/formatFeature.ts"
import { getLinesFromDB, LineDefinition } from "../../utils/idbUtils.ts" // Added

// Helper function to get all POIs from projectData into a Map for easy lookup
const getAllPoisMap = (projectData: SavedFeaturesStateType): Map<string, GeoJsonFeature> => {
  const allPois = new Map<string, GeoJsonFeature>();
  Object.values(projectData).forEach(categoryFeatures => {
    categoryFeatures.forEach(feature => {
      if (feature.properties?.id) {
        allPois.set(feature.properties.id, feature);
      }
    });
  });
  return allPois;
};

const convertToMultiLineString = (feature: GeoJsonFeature): GeoJsonFeature => {
  if (feature.geometry.type === "Polygon") {
    // For a Polygon, convert only the outer ring to a LineString
    return {
      ...feature,
      geometry: {
        type: "MultiLineString",
        coordinates: [feature.geometry.coordinates[0]], // Only outer ring
      },
    }
  } else if (feature.geometry.type === "MultiPolygon") {
    // For MultiPolygon, convert each polygon's outer ring into a separate LineString within MultiLineString
    const multiLineStringCoords = feature.geometry.coordinates.map((polygon) => polygon[0]) // Outer ring of each polygon
    return {
      ...feature,
      geometry: {
        type: "MultiLineString",
        coordinates: multiLineStringCoords,
      },
    }
  } else {
    // If it's not a Polygon or MultiPolygon, return it unchanged
    return feature
  }
}

export const saveAsKml = (savedFeatures: SavedFeaturesStateType) => {
  const zip = new JSZip()

  Object.entries(savedFeatures).map(([category, features]) => {
    const data: GeoJsonCollection = {
      type: "FeatureCollection",
      features: features.map((feature): GeoJsonFeature => {
        feature = formatFeature(feature)
        feature = convertToMultiLineString(feature)
        return feature
      }),
    }

    const kml: string = tokml(data)
    zip.file(`${category}.kml`, kml)
  })

  zip.generateAsync({ type: "blob" }).then((blob) => {
    FileSaver.saveAs(blob, "trip_explorer_features.zip")
  })
}

// New function for saving a specific project's KML data
export const saveProjectAsKml = (projectData: SavedFeaturesStateType, projectName: string) => {
  const zip = new JSZip()

  Object.entries(projectData).map(([category, features]) => {
    const poiFeatureCollection: GeoJsonCollection = {
      type: "FeatureCollection",
      features: features.map((feature): GeoJsonFeature => {
        feature = formatFeature(feature)
        feature = convertToMultiLineString(feature) // Ensure polygons are handled for KML points/lines
        return feature
      }),
    }

    if (poiFeatureCollection.features.length > 0) {
      const kmlPois: string = tokml(poiFeatureCollection, {
        name: "name", // Assumes POIs have a 'name' in properties
        description: "description", // Assumes POIs have a 'description'
        documentName: `${projectName} - ${category} POIs`,
        documentDescription: `Points of Interest from category ${category}`,
      })
      zip.file(`${projectName}_${category}_pois.kml`, kmlPois)
    }
  })

  // Fetch and add Line data as a separate KML file
  try {
    const lines: LineDefinition[] = await getLinesFromDB(projectName)
    if (lines && lines.length > 0) {
      const allPoisMap = getAllPoisMap(projectData);
      const lineFeatures: GeoJsonFeature[] = [];

      lines.forEach(line => {
        const coordinates: TCoordinateTuple[] = [];
        line.poiIds.forEach(poiId => {
          const poi = allPoisMap.get(poiId);
          if (poi && poi.geometry.type === "Point") {
            coordinates.push(poi.geometry.coordinates as TCoordinateTuple);
          }
        });

        if (coordinates.length >= 2) { // A line needs at least two points
          lineFeatures.push({
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: coordinates,
            },
            properties: {
              name: line.name,
              // Add any other relevant line properties here
            },
          });
        }
      });

      if (lineFeatures.length > 0) {
        const linesFeatureCollection: GeoJsonCollection = {
          type: "FeatureCollection",
          features: lineFeatures,
        };
        const kmlLines: string = tokml(linesFeatureCollection, {
          name: "name", // Use 'name' from line properties for placemark name
          documentName: `${projectName} - Routes`,
          documentDescription: "Saved routes/lines for the project",
        });
        zip.file(`${projectName}_routes.kml`, kmlLines);
      }
    }
  } catch (error) {
    console.error("Error fetching or processing lines for KML export:", error)
    // Decide if you want to notify the user or proceed without lines
  }

  zip.generateAsync({ type: "blob" }).then((blob) => {
    FileSaver.saveAs(blob, `trip_explorer_project_${projectName}_kml.zip`)
  })
}
