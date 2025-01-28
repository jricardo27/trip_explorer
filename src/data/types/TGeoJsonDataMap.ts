export interface GeoJsonGeometry {
  type: "Point" | "MultiPoint" | "LineString" | "MultiLineString" | "Polygon" | "MultiPolygon"
  coordinates: [number, number]
}

export interface GeoJsonProperties {
  [key: string]: never
}

export interface GeoJsonFeature {
  type: "Feature"
  properties: GeoJsonProperties
  geometry: GeoJsonGeometry
}

export interface GeoJsonData {
  type: "FeatureCollection"
  features: GeoJsonFeature[]
}

export type GeoJsonDataMap = Record<string, GeoJsonData | null>
