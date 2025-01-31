import axios from "axios"
import { useEffect, useState } from "react"

import { GeoJsonCollection, GeoJsonDataMap, GeoJsonFeature, GeoJsonProperties } from "../data/types"
import deepMerge from "../utils/deepmerge.ts"

const useGeoJsonMarkers = (filenames: string[]): GeoJsonDataMap => {
  const [geoJsonData, setGeoJsonData] = useState<GeoJsonDataMap>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const timestamp = Date.now()
        const promises = filenames.map(async (filename) => {
          const response = await axios.get<GeoJsonCollection>(filename, { params: { t: timestamp } })
          return [filename, response.data]
        })

        const results = await Promise.all(promises)
        const dataMap: GeoJsonDataMap = results.reduce((acc, [filename, featureCollection]) => {
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
              if (typeof sharedProperties[key] === "object" &&
                sharedProperties[key] !== null &&
                feature.properties[key] !== undefined) {
                // If both are objects, merge them deeply
                feature.properties[key] = deepMerge(sharedProperties[key], feature.properties[key])
              }
            })
          })

          acc[filename] = featureCollection
          return acc
        }, {})
        setGeoJsonData(dataMap)
      } catch (err: unknown) {
        setError(err.message)
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
