import { useEffect, useState } from "react"

import deepMerge from "../utils/deepmerge.ts"

const filePaths = [
  "/markers/westernAustralia/gas_stations_openstreetmap.json",
  "/markers/westernAustralia/gas_stations_fuelwatch.json",
  "/markers/westernAustralia/gas_stations_bp.json",
  "/markers/westernAustralia/national_parks.json",
  "/markers/westernAustralia/places.json",
]

const useMarkersWA = () => {
  const [markers, setMarkers] = useState<object[]>([])

  useEffect(() => {
    const loadMarkers = async () => {
      try {
        const timestamp = Date.now()
        const responses = await Promise.all(
          filePaths.map((path) => fetch(`${path}?t=${timestamp}`).then((res) => res.json())),
        )

        // Merge shared properties with each feature's properties
        const mergedMarkers = responses.map((featureCollection) => {
          const { properties: sharedProperties, features } = featureCollection

          return features.map((feature) => ({
            ...feature,
            properties: deepMerge(deepMerge({}, sharedProperties), feature.properties),
          }))
        }).flat() // Flatten the array of arrays into a single array

        setMarkers(mergedMarkers)
      } catch (error) {
        console.error("Error loading markers:", error)
      }
    }

    loadMarkers()
  }, [])

  return markers
}

export default useMarkersWA
