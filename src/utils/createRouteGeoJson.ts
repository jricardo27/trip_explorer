import * as GeoJSON from "geojson"
import { GeoJsonFeature, TCoordinate } from "../data/types"

/**
 * Creates a GeoJSON LineString from an array of GeoJsonFeatures.
 * Features must have geometry of type Point.
 *
 * @param features - An array of GeoJsonFeature points.
 * @returns A GeoJSON LineString object, or null if input is invalid.
 */
export const createRouteGeoJson = (features: GeoJsonFeature[]): GeoJSON.LineString | null => {
  if (!features || features.length < 2) {
    return null // Not enough points to form a line
  }

  const coordinates: TCoordinate[] = []
  for (const feature of features) {
    if (feature.geometry.type === "Point") {
      coordinates.push(feature.geometry.coordinates as TCoordinate)
    } else {
      // Or handle non-Point geometries differently, e.g., by taking the centroid
      console.warn("Feature is not a Point, skipping in route generation:", feature)
    }
  }

  if (coordinates.length < 2) {
    return null // Not enough valid points
  }

  return {
    type: "LineString",
    coordinates: coordinates,
  }
}
