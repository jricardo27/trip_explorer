import { GeoJsonFeature } from "../../data/types"; // Import the global GeoJsonFeature type

// The local GeoJsonFeature interface definition has been removed.

export const filterFeatures = (features: GeoJsonFeature[], searchQuery: string): GeoJsonFeature[] => {
  if (!searchQuery) {
    return features;
  }

  const query = searchQuery.toLowerCase();
  return features.filter(feature => {
    const nameMatch = feature.properties?.name &&
      typeof feature.properties.name === "string" &&
      feature.properties.name.toLowerCase().includes(query);
    const descriptionMatch = feature.properties?.description &&
      typeof feature.properties.description === "string" &&
      feature.properties.description.toLowerCase().includes(query);
    return nameMatch || descriptionMatch;
  });
};
