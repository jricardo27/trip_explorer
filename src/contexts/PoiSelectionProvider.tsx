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

import { CategoryInfo } from "./PoiSelectionContext.ts" // Added import

export const PoiSelectionProvider = ({ children }: PoiSelectionProviderProps) => {
  const [selectedRegion, setSelectedRegion] = useState<string>("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]) // Stores raw filenames
  const [availableCategories, setAvailableCategories] = useState<CategoryInfo[]>([]) // Stores CategoryInfo objects

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
    setAvailableCategories, // Though set directly by useEffect, including for completeness or future use
  }

  return (
    <PoiSelectionContext.Provider value={contextValue}>
      {children}
    </PoiSelectionContext.Provider>
  )
}
