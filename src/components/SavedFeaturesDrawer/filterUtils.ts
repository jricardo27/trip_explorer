// Define a simplified GeoJsonFeature type for our filtering purposes
export interface GeoJsonFeature {
  type: "Feature";
  properties: {
    // Making name and description optional as per test cases
    name?: string;
    description?: string;
    // Allow other properties
    [key: string]: any;
  };
  geometry: {
    type: string;
    coordinates: any;
  };
  id?: string;
}

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
