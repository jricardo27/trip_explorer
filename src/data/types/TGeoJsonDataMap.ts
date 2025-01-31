export interface GeoJsonGeometry {
  type: "Point" | "MultiPoint" | "LineString" | "MultiLineString" | "Polygon" | "MultiPolygon"
  coordinates: [number, number]
}

export interface GeoJsonProperties {
  [key: string | Record<string, never>]: never
}

export interface GeoJsonFeature {
  type: "Feature"
  properties: GeoJsonProperties
  geometry: GeoJsonGeometry
}

export interface GeoJsonCollection {
  type: "FeatureCollection"
  properties: GeoJsonProperties
  features: GeoJsonFeature[]
}

export type GeoJsonDataMap = Record<string, GeoJsonCollection | null>
