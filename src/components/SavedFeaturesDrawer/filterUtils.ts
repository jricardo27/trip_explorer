import { GeoJsonFeature } from "../../data/types"; // Import the global GeoJsonFeature type

// The local GeoJsonFeature interface definition has been removed.

export const filterFeatures = (
  items: Array<{ feature: GeoJsonFeature; originalIndex: number }>,
  searchQuery: string
): Array<{ feature: GeoJsonFeature; originalIndex: number }> => {
  if (!searchQuery) {
    return items; // Return all items if searchQuery is empty
  }

  const query = searchQuery.toLowerCase();
  return items.filter(item => {
    const feature = item.feature; // Get the feature from the item
    const nameMatch = feature.properties?.name &&
      typeof feature.properties.name === 'string' &&
      feature.properties.name.toLowerCase().includes(query);
    const descriptionMatch = feature.properties?.description &&
      typeof feature.properties.description === 'string' &&
      feature.properties.description.toLowerCase().includes(query);
    return nameMatch || descriptionMatch;
  });
};
