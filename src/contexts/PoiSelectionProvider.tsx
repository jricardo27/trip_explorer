import React, { useState, useEffect, ReactNode } from "react"
import { PoiSelectionContext, PoiSelectionContextType } from "./PoiSelectionContext.ts"

interface PoiSelectionProviderProps {
  children: ReactNode
}

const formatCategoryName = (filename: string) => {
  return filename
    .replace(".json", "")
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

import { CategoryInfo, RegionInfo } from "./PoiSelectionContext.ts" // Added RegionInfo

export const PoiSelectionProvider = ({ children }: PoiSelectionProviderProps) => {
  const [selectedRegion, setSelectedRegion] = useState<string>("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]) // Stores raw filenames
  const [availableCategories, setAvailableCategories] = useState<CategoryInfo[]>([]) // Stores CategoryInfo objects
  const [regionsList, setRegionsList] = useState<RegionInfo[]>([]) // New state for regions

  // Fetch regions list on mount
  useEffect(() => {
    fetch("/markers/regions-manifest.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch regions-manifest.json")
        }
        return response.json()
      })
      .then((data) => {
        setRegionsList(data as RegionInfo[]) // Assuming data is Array<RegionInfo>
      })
      .catch((error) => {
        console.error("Error fetching regions-manifest.json:", error)
        setRegionsList([]) // Set to empty or handle error appropriately
      })
  }, [])

  // Fetch available categories when selectedRegion changes
  useEffect(() => {
    if (selectedRegion) {
      fetch(`/markers/${selectedRegion}/manifest.json`)
        .then((response) => response.json())
        .then((data) => {
          if (data && data.files && Array.isArray(data.files)) {
            const categoryInfos: CategoryInfo[] = data.files.map((fileName: string) => ({
              displayName: formatCategoryName(fileName),
              fileName: fileName,
            }))
            setAvailableCategories(categoryInfos)
          } else {
            setAvailableCategories([])
          }
          setSelectedCategories([]) // Reset selected categories when region changes
        })
        .catch((error) => {
          console.error("Error fetching manifest.json:", error)
          setAvailableCategories([])
          setSelectedCategories([])
        })
    } else {
      setAvailableCategories([])
      setSelectedCategories([])
    }
  }, [selectedRegion])

  const contextValue: PoiSelectionContextType = {
    selectedRegion,
    setSelectedRegion,
    selectedCategories,
    setSelectedCategories,
    availableCategories,
    setAvailableCategories,
    regions: regionsList, // Pass regionsList as regions
  }

  return (
    <PoiSelectionContext.Provider value={contextValue}>
      {children}
    </PoiSelectionContext.Provider>
  )
}
