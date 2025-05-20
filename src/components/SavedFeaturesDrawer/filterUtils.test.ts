import { describe, it, expect } from 'vitest';
import { filterFeatures, GeoJsonFeature } from './filterUtils';

// Mock GeoJsonFeature objects
const mockFeatures: GeoJsonFeature[] = [
  {
    type: "Feature",
    properties: { name: "Alpha Park", description: "A beautiful park with many trees" },
    geometry: { type: "Point", coordinates: [0, 0] },
    id: "1"
  },
  {
    type: "Feature",
    properties: { name: "Beta Garden", description: "A lovely garden full of flowers" },
    geometry: { type: "Polygon", coordinates: [[[0,0]]]},
    id: "2"
  },
  {
    type: "Feature",
    properties: { name: "Gamma Point", description: "A scenic spot with alpha views" },
    geometry: { type: "LineString", coordinates: [[0,0]]},
    id: "3"
  },
  {
    type: "Feature",
    properties: { name: "Delta Place" }, // Missing description
    geometry: { type: "Point", coordinates: [1, 1] },
    id: "4"
  },
  {
    type: "Feature",
    properties: { description: "Epsilon Area with unique plants" }, // Missing name
    geometry: { type: "Point", coordinates: [2, 2] },
    id: "5"
  },
  {
    type: "Feature",
    properties: {}, // Missing both name and description
    geometry: { type: "Point", coordinates: [3, 3] },
    id: "6"
  },
  {
    type: "Feature",
    properties: { name: "zeta spot", description: "another lovely spot" }, // lowercase name for case-insensitivity test
    geometry: { type: "Point", coordinates: [4, 4] },
    id: "7"
  }
];

describe('filterFeatures', () => {
  it('should return all features if search query is empty', () => {
    expect(filterFeatures(mockFeatures, '')).toEqual(mockFeatures);
  });

  it('should filter by name (exact match)', () => {
    const result = filterFeatures(mockFeatures, 'Alpha Park');
    expect(result).toHaveLength(1);
    expect(result[0].properties.name).toBe('Alpha Park');
  });

  it('should filter by name (partial match)', () => {
    const result = filterFeatures(mockFeatures, 'Park');
    expect(result).toHaveLength(1);
    expect(result[0].properties.name).toBe('Alpha Park');
  });

  it('should filter by name (case-insensitive)', () => {
    const result = filterFeatures(mockFeatures, 'alpha park');
    expect(result).toHaveLength(1);
    expect(result[0].properties.name).toBe('Alpha Park');
  });

  it('should filter by description (exact match)', () => {
    const result = filterFeatures(mockFeatures, 'A lovely garden full of flowers');
    expect(result).toHaveLength(1);
    expect(result[0].properties.description).toBe('A lovely garden full of flowers');
  });

  it('should filter by description (partial match)', () => {
    const result = filterFeatures(mockFeatures, 'lovely');
    expect(result).toHaveLength(2); // "Beta Garden" and "zeta spot"
    expect(result.some(f => f.properties.name === 'Beta Garden')).toBe(true);
    expect(result.some(f => f.properties.name === 'zeta spot')).toBe(true);
  });

  it('should filter by description (case-insensitive)', () => {
    const result = filterFeatures(mockFeatures, 'a lovely garden');
    expect(result).toHaveLength(1);
    expect(result[0].properties.name).toBe('Beta Garden');
  });

  it('should filter by query matching part of description ("alpha views")', () => {
    const result = filterFeatures(mockFeatures, 'alpha views');
    expect(result).toHaveLength(1);
    expect(result[0].properties.name).toBe('Gamma Point');
  });
  
  it('should filter by query matching part of name ("Gam")', () => {
    const result = filterFeatures(mockFeatures, 'Gam');
    expect(result).toHaveLength(1);
    expect(result[0].properties.name).toBe('Gamma Point');
  });

  it('should return an empty array if no features match the search query', () => {
    const result = filterFeatures(mockFeatures, 'NonExistentPlace');
    expect(result).toHaveLength(0);
  });

  it('should handle features with missing description property', () => {
    const result = filterFeatures(mockFeatures, 'Delta Place');
    expect(result).toHaveLength(1);
    expect(result[0].properties.name).toBe('Delta Place');
  });

  it('should handle features with missing name property', () => {
    const result = filterFeatures(mockFeatures, 'Epsilon Area');
    expect(result).toHaveLength(1);
    expect(result[0].properties.description).toBe('Epsilon Area with unique plants');
  });
  
  it('should include features if name matches, even if description is missing', () => {
    const result = filterFeatures(mockFeatures, 'Delta');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('4');
  });

  it('should include features if description matches, even if name is missing', () => {
    const result = filterFeatures(mockFeatures, 'Epsilon');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('5');
  });

  it('should not crash and correctly exclude features with no name or description when searching', () => {
    const result = filterFeatures(mockFeatures, 'MissingBoth');
    expect(result).toHaveLength(0);
  });
  
  it('should not include features with missing name and description if search query is non-empty', () => {
    // Feature with id "6" has no name or description
    let result = filterFeatures(mockFeatures, 'Alpha');
    expect(result.some(f => f.id === "6")).toBe(false);

    result = filterFeatures(mockFeatures, 'Anything');
    expect(result.some(f => f.id === "6")).toBe(false);
  });

  it('should correctly perform case-insensitive search for names like "zeta spot"', () => {
    const result = filterFeatures(mockFeatures, 'zeta');
    expect(result).toHaveLength(1);
    expect(result[0].properties.name).toBe('zeta spot');
    
    const resultCaps = filterFeatures(mockFeatures, 'ZETA');
    expect(resultCaps).toHaveLength(1);
    expect(resultCaps[0].properties.name).toBe('zeta spot');
  });

  it('should return features that match either name or description', () => {
    // "alpha" is in "Alpha Park" name and "Gamma Point" description
    const result = filterFeatures(mockFeatures, 'alpha');
    expect(result).toHaveLength(2);
    expect(result.some(f => f.properties.name === 'Alpha Park')).toBe(true);
    expect(result.some(f => f.properties.name === 'Gamma Point')).toBe(true);
  });
});
