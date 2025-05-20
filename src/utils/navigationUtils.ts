import { GeoJsonFeature } from "../data/types";

export const getCoordinatesForNavigation = (
  feature: GeoJsonFeature | null | undefined
): [number, number] | null => {
  if (!feature || !feature.geometry) {
    if (!feature) {
        console.warn("getCoordinatesForNavigation: Feature is null or undefined.");
    } else {
        console.warn(`getCoordinatesForNavigation: Geometry is missing for feature ID: ${feature.id || 'N/A'}.`);
    }
    return null;
  }

  const geometry = feature.geometry;
  let lngStr: string | number | undefined;
  let latStr: string | number | undefined;

  if (geometry.type === 'Point' && geometry.coordinates && geometry.coordinates.length === 2) {
    lngStr = geometry.coordinates[0];
    latStr = geometry.coordinates[1];
  } else if (geometry.type === 'LineString' && geometry.coordinates && geometry.coordinates[0] && geometry.coordinates[0].length === 2) {
    lngStr = geometry.coordinates[0][0];
    latStr = geometry.coordinates[0][1];
  } else if (geometry.type === 'Polygon' && geometry.coordinates && geometry.coordinates[0] && geometry.coordinates[0][0] && geometry.coordinates[0][0].length === 2) {
    lngStr = geometry.coordinates[0][0][0];
    latStr = geometry.coordinates[0][0][1];
  } else {
    console.warn(
      `getCoordinatesForNavigation: Unsupported geometry type (${geometry.type}) or malformed coordinates for feature ID: ${feature.id || 'N/A'}.`
    );
    return null;
  }

  if (lngStr !== undefined && latStr !== undefined) {
    const lng = parseFloat(String(lngStr));
    const lat = parseFloat(String(latStr));

    if (!isNaN(lng) && !isNaN(lat)) {
      return [lat, lng]; // Leaflet-ready coordinates
    } else {
      console.error(
        `getCoordinatesForNavigation: Invalid coordinates after parsing for feature ID: ${feature.id || 'N/A'}. Original values:`,
        { lngStr, latStr }
      );
      return null;
    }
  } else {
    console.error(`getCoordinatesForNavigation: Coordinates could not be extracted for feature ID: ${feature.id || 'N/A'}.`);
    return null;
  }
};
