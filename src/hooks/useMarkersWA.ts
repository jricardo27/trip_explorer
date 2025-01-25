import { useEffect, useState } from "react"

const filePaths = [
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

        setMarkers(responses)
      } catch (error) {
        console.error("Error loading markers:", error)
      }
    }

    loadMarkers()
  }, [])

  return markers
}

export default useMarkersWA
