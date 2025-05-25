import axios from "axios"
import { useEffect, useState } from "react"

import { GeoJsonCollection, GeoJsonDataMap, GeoJsonFeature, GeoJsonProperties, TAny } from "../data/types"
import deepMerge from "../utils/deepmerge.ts"

/**
 * Custom hook to fetch and process GeoJSON data from a list of file paths.
 *
 * It loads multiple GeoJSON files, merges shared properties from the FeatureCollection
 * into individual features, and provides the combined data along with loading and error states.
 * In development mode, it appends a timestamp to the request URL to bypass browser cache.
 *
 * @param filenames An array of strings, where each string is a path to a GeoJSON file.
 * @returns A `GeoJsonDataMap` object where keys are filenames and values are the
 *          corresponding `GeoJsonCollection`. The returned object also includes optional
 *          `loading` (boolean) and `error` (string) properties to indicate the fetch status.
 */
const useGeoJsonMarkers = (filenames: string[]): GeoJsonDataMap => {
  const [geoJsonData, setGeoJsonData] = useState<GeoJsonDataMap>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    /**
     * Fetches and processes GeoJSON data from the provided filenames.
     * Handles merging of shared properties and updates loading/error states.
     */
    const fetchData = async () => {
      setLoading(true)
      try {
        const isProduction = import.meta.env.MODE === "production";
        let requestConfig = {};

        if (!isProduction) { // Always reload the files when running in development
          requestConfig = { params: { t: Date.now() } };
        }

        const promises = filenames.map(async (filename): Promise<[string, GeoJsonCollection]> => {
          const response = await axios.get<GeoJsonCollection>(filename, requestConfig);

          if (typeof response.data == "string") {
            throw new Error(`Error requesting ${filename}, ensure that the path is valid.`)
          }

          return [filename, response.data]
        })

        const results = await Promise.all(promises)
        const dataMap: GeoJsonDataMap = results.reduce((acc: Record<string, GeoJsonCollection>, [filename, featureCollection]) => {
          const sharedProperties: GeoJsonProperties = featureCollection.properties || {}

          featureCollection.features.forEach((feature: GeoJsonFeature) => {
            if (feature.type !== "Feature") {
              console.warn("Skipping non-feature item in features array")
              return
            }

            // Merge top-level properties
            feature.properties = {
              ...sharedProperties,
              ...feature.properties,
            }

            // Handle nested properties
            Object.keys(sharedProperties).forEach((key) => {
              if (typeof sharedProperties[key] === "object" && sharedProperties[key] !== null) {
                const sourceProp = feature.properties?.[key]
                if (typeof sourceProp === "object" && sourceProp !== null) {
                  feature.properties![key] = deepMerge(sharedProperties[key] as Record<string, TAny>, sourceProp as Record<string, TAny>)
                } else {
                  // If sourceProp is not an object or is null, just assign sharedProperties value
                  feature.properties![key] = sharedProperties[key]
                }
              }
            })
          })

          acc[filename] = featureCollection
          return acc
        }, {})
        setGeoJsonData(dataMap)
      } catch (err: unknown) {
        console.error(err)

        if (err instanceof Error) {
          setError(err.message)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [filenames])

  if (loading) {
    return { ...geoJsonData, loading: true } as GeoJsonDataMap & { loading: true } // Return the current data and loading state
  }

  if (error) {
    console.error(error)
    return { ...geoJsonData, error } as GeoJsonDataMap & { error: string } // Return the current data and loading state
  }

  return geoJsonData
}

export default useGeoJsonMarkers
