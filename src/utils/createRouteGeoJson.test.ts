import { GeoJsonFeature, TCoordinate } from "../data/types"
import { createRouteGeoJson } from "./createRouteGeoJson"
import * as GeoJSON from "geojson"

describe("createRouteGeoJson", () => {
  const point1: GeoJsonFeature = {
    type: "Feature",
    geometry: { type: "Point", coordinates: [1, 1] as TCoordinate },
    properties: { id: "p1", name: "Point 1" },
  }
  const point2: GeoJsonFeature = {
    type: "Feature",
    geometry: { type: "Point", coordinates: [2, 2] as TCoordinate },
    properties: { id: "p2", name: "Point 2" },
  }
  const point3: GeoJsonFeature = {
    type: "Feature",
    geometry: { type: "Point", coordinates: [3, 3] as TCoordinate },
    properties: { id: "p3", name: "Point 3" },
  }
  const nonPointFeature: GeoJsonFeature = { // @ts-expect-error - Deliberately creating a non-point for testing
    type: "Feature",
    geometry: { type: "Polygon", coordinates: [[[0,0],[0,1],[1,1],[1,0],[0,0]]] },
    properties: { id: "poly1", name: "Polygon 1"},
  }


  it("should return null if less than two features are provided", () => {
    expect(createRouteGeoJson([])).toBeNull()
    expect(createRouteGeoJson([point1])).toBeNull()
  })

  it("should create a LineString GeoJSON from two points", () => {
    const features = [point1, point2]
    const expectedGeoJson: GeoJSON.LineString = {
      type: "LineString",
      coordinates: [
        [1, 1],
        [2, 2],
      ],
    }
    expect(createRouteGeoJson(features)).toEqual(expectedGeoJson)
  })

  it("should create a LineString GeoJSON from multiple points in order", () => {
    const features = [point1, point2, point3]
    const expectedGeoJson: GeoJSON.LineString = {
      type: "LineString",
      coordinates: [
        [1, 1],
        [2, 2],
        [3, 3],
      ],
    }
    expect(createRouteGeoJson(features)).toEqual(expectedGeoJson)
  })

  it("should ignore non-Point features and still form a line if enough points remain", () => {
    const features = [point1, nonPointFeature, point2, point3]
    const expectedGeoJson: GeoJSON.LineString = {
      type: "LineString",
      coordinates: [
        [1, 1],
        [2, 2],
        [3, 3],
      ],
    }
    expect(createRouteGeoJson(features)).toEqual(expectedGeoJson)
  })

  it("should return null if, after filtering non-Points, less than two points remain", () => {
    expect(createRouteGeoJson([point1, nonPointFeature])).toBeNull()
    expect(createRouteGeoJson([nonPointFeature, nonPointFeature])).toBeNull()
  })

  it("should handle empty array input", () => {
    expect(createRouteGeoJson([])).toBeNull()
  })

  it("should handle array with only non-point features", () => {
    const features = [nonPointFeature, nonPointFeature]
    expect(createRouteGeoJson(features)).toBeNull()
  })
})
