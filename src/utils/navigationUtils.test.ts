import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GeoJsonFeature } from '../data/types'; // Adjust path as necessary
import { getCoordinatesForNavigation } from './navigationUtils';

describe('getCoordinatesForNavigation', () => {
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  // --- Point Geometry Tests ---
  describe('Point Geometry', () => {
    it('should return [lat, lng] for valid Point coordinates', () => {
      const feature: GeoJsonFeature = {
        type: 'Feature',
        id: 'point1',
        geometry: { type: 'Point', coordinates: [10, 20] },
        properties: {},
      };
      expect(getCoordinatesForNavigation(feature)).toEqual([20, 10]);
    });

    it('should return [lat, lng] for Point coordinates as strings', () => {
      const feature: GeoJsonFeature = {
        type: 'Feature',
        id: 'point2',
        geometry: { type: 'Point', coordinates: ['10.5', '20.5'] },
        properties: {},
      };
      expect(getCoordinatesForNavigation(feature)).toEqual([20.5, 10.5]);
    });

    it('should return null for Point with malformed coordinates (too few)', () => {
      const feature: GeoJsonFeature = {
        type: 'Feature',
        id: 'point3',
        geometry: { type: 'Point', coordinates: [10] },
        properties: {},
      };
      expect(getCoordinatesForNavigation(feature)).toBeNull();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('malformed coordinates for feature ID: point3')
      );
    });
    
    it('should return null for Point with malformed coordinates (not an array)', () => {
      const feature: GeoJsonFeature = {
        type: 'Feature',
        id: 'point-malformed-coords',
        // @ts-expect-error Testing malformed input
        geometry: { type: 'Point', coordinates: "10,20" },
        properties: {},
      };
      expect(getCoordinatesForNavigation(feature)).toBeNull();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('malformed coordinates for feature ID: point-malformed-coords')
      );
    });
  });

  // --- LineString Geometry Tests ---
  describe('LineString Geometry', () => {
    it('should return first [lat, lng] for valid LineString coordinates', () => {
      const feature: GeoJsonFeature = {
        type: 'Feature',
        id: 'line1',
        geometry: { type: 'LineString', coordinates: [[1, 2], [3, 4]] },
        properties: {},
      };
      expect(getCoordinatesForNavigation(feature)).toEqual([2, 1]);
    });

    it('should return first [lat, lng] for LineString coordinates as strings', () => {
      const feature: GeoJsonFeature = {
        type: 'Feature',
        id: 'line2',
        geometry: { type: 'LineString', coordinates: [['1.5', '2.5'], ['3.5', '4.5']] },
        properties: {},
      };
      expect(getCoordinatesForNavigation(feature)).toEqual([2.5, 1.5]);
    });

    it('should return null for LineString with empty coordinates array', () => {
      const feature: GeoJsonFeature = {
        type: 'Feature',
        id: 'line3',
        geometry: { type: 'LineString', coordinates: [] },
        properties: {},
      };
      expect(getCoordinatesForNavigation(feature)).toBeNull();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('malformed coordinates for feature ID: line3')
      );
    });
    
    it('should return null for LineString with malformed first point', () => {
        const feature: GeoJsonFeature = {
            type: 'Feature',
            id: 'line-malformed-point',
            geometry: { type: 'LineString', coordinates: [[1], [2,3]]},
            properties: {}
        };
        expect(getCoordinatesForNavigation(feature)).toBeNull();
        expect(consoleWarnSpy).toHaveBeenCalledWith(
            expect.stringContaining('malformed coordinates for feature ID: line-malformed-point')
        );
    });
  });

  // --- Polygon Geometry Tests ---
  describe('Polygon Geometry', () => {
    it('should return first [lat, lng] of first ring for valid Polygon', () => {
      const feature: GeoJsonFeature = {
        type: 'Feature',
        id: 'poly1',
        geometry: { type: 'Polygon', coordinates: [[[1, 2], [3, 4], [5, 6], [1, 2]]] },
        properties: {},
      };
      expect(getCoordinatesForNavigation(feature)).toEqual([2, 1]);
    });

    it('should return first [lat, lng] for Polygon coordinates as strings', () => {
      const feature: GeoJsonFeature = {
        type: 'Feature',
        id: 'poly2',
        geometry: { type: 'Polygon', coordinates: [[['1.1', '2.2'], ['3.3', '4.4']]] },
        properties: {},
      };
      expect(getCoordinatesForNavigation(feature)).toEqual([2.2, 1.1]);
    });

    it('should return null for Polygon with empty coordinates array', () => {
      const feature: GeoJsonFeature = {
        type: 'Feature',
        id: 'poly3',
        geometry: { type: 'Polygon', coordinates: [] },
        properties: {},
      };
      expect(getCoordinatesForNavigation(feature)).toBeNull();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('malformed coordinates for feature ID: poly3')
      );
    });

    it('should return null for Polygon with empty first ring', () => {
      const feature: GeoJsonFeature = {
        type: 'Feature',
        id: 'poly4',
        geometry: { type: 'Polygon', coordinates: [[]] },
        properties: {},
      };
      expect(getCoordinatesForNavigation(feature)).toBeNull();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('malformed coordinates for feature ID: poly4')
      );
    });
    
    it('should return null for Polygon with malformed first point in first ring', () => {
        const feature: GeoJsonFeature = {
            type: 'Feature',
            id: 'poly-malformed-point',
            geometry: { type: 'Polygon', coordinates: [[[1], [2,3]]]},
            properties: {}
        };
        expect(getCoordinatesForNavigation(feature)).toBeNull();
        expect(consoleWarnSpy).toHaveBeenCalledWith(
            expect.stringContaining('malformed coordinates for feature ID: poly-malformed-point')
        );
    });
  });

  // --- Unsupported Geometry and Null/Undefined Tests ---
  describe('Unsupported Geometry and Null/Undefined Inputs', () => {
    it('should return null for unsupported geometry type (MultiPoint)', () => {
      const feature: GeoJsonFeature = {
        type: 'Feature',
        id: 'multipoint1',
        // @ts-expect-error Testing unsupported type
        geometry: { type: 'MultiPoint', coordinates: [[1, 2]] },
        properties: {},
      };
      expect(getCoordinatesForNavigation(feature)).toBeNull();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Unsupported geometry type (MultiPoint) or malformed coordinates for feature ID: multipoint1')
      );
    });

    it('should return null if geometry is null', () => {
      const feature: GeoJsonFeature = {
        type: 'Feature',
        id: 'geomNull',
        geometry: null,
        properties: {},
      };
      expect(getCoordinatesForNavigation(feature)).toBeNull();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Geometry is missing for feature ID: geomNull')
      );
    });
    
    it('should return null if geometry is undefined', () => {
        const feature: GeoJsonFeature = {
            type: 'Feature',
            id: 'geomUndefined',
            // @ts-expect-error Testing undefined geometry
            geometry: undefined,
            properties: {}
        };
        expect(getCoordinatesForNavigation(feature)).toBeNull();
        expect(consoleWarnSpy).toHaveBeenCalledWith(
            expect.stringContaining('Geometry is missing for feature ID: geomUndefined')
        );
    });

    it('should return null if feature is null', () => {
      expect(getCoordinatesForNavigation(null)).toBeNull();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'getCoordinatesForNavigation: Feature is null or undefined.'
      );
    });

    it('should return null if feature is undefined', () => {
      expect(getCoordinatesForNavigation(undefined)).toBeNull();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'getCoordinatesForNavigation: Feature is null or undefined.'
      );
    });
  });

  // --- Coordinate Parsing Tests ---
  describe('Coordinate Parsing Logic', () => {
    it('should return null for non-parseable string coordinates', () => {
      const feature: GeoJsonFeature = {
        type: 'Feature',
        id: 'parseFail',
        geometry: { type: 'Point', coordinates: ['abc', 'def'] },
        properties: {},
      };
      expect(getCoordinatesForNavigation(feature)).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid coordinates after parsing for feature ID: parseFail'),
        { lngStr: 'abc', latStr: 'def' }
      );
    });
  });
});
