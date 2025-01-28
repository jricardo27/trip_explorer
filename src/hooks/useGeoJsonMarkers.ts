import axios from "axios"
import { useState, useEffect } from "react"

import { GeoJsonData, GeoJsonDataMap, GeoJsonFeature } from "../data/types"
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
          const response = await axios.get<GeoJsonData>(filename, { params: { t: timestamp } })
          return [filename, response.data]
        })

        const results = await Promise.all(promises)
        const dataMap: GeoJsonDataMap = results.reduce((acc, [filename, featureCollection]) => {
          const sharedProperties = featureCollection.properties || {}
          const features = featureCollection.features || []

          featureCollection.features = features.map((feature: GeoJsonFeature) => ({
            ...feature,
            properties: deepMerge(deepMerge({}, sharedProperties), feature.properties),
          }))

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
