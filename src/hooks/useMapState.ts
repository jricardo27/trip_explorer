import { useEffect } from "react"

import { TCoordinate } from "../data/types"

interface UseMapStateProps {
  capitalCity: TCoordinate | [number, number]
}

export const useMapState = ({ capitalCity }: UseMapStateProps) => {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const isFreshLoad = urlParams.get("fresh") === "true"
    const destination = window.location.pathname
    const mapStateKey = "mapState"
    const storedMapState = localStorage.getItem(mapStateKey)

    if (isFreshLoad || !storedMapState) {
      localStorage.removeItem(mapStateKey)
      const newMapState = JSON.stringify({ center: capitalCity, zoom: 10 })
      localStorage.setItem(mapStateKey, newMapState)

      if (isFreshLoad) {
        urlParams.delete("fresh")
        const newUrl = `${destination}${urlParams.toString() ? `?${urlParams.toString()}` : ""}`
        window.history.replaceState({}, document.title, newUrl)
      }
    }
  }, [capitalCity])
}
