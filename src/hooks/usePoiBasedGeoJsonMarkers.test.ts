import { renderHook } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { usePoiBasedGeoJsonMarkers } from "./usePoiBasedGeoJsonMarkers.ts"
import { usePoiSelection } from "../contexts/PoiSelectionContext.ts"
import { useGeoJsonMarkers } from "./useGeoJsonMarkers.ts"

// Mock usePoiSelection
vi.mock("../contexts/PoiSelectionContext.ts", () => ({
  usePoiSelection: vi.fn(),
}))

// Mock useGeoJsonMarkers
vi.mock("./useGeoJsonMarkers.ts", () => ({
  useGeoJsonMarkers: vi.fn(),
}))

describe("usePoiBasedGeoJsonMarkers", () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it("should return default values when no region or categories are selected", () => {
    ;(usePoiSelection as vi.Mock).mockReturnValue({
      selectedRegion: "",
      selectedCategories: [],
    })
    ;(useGeoJsonMarkers as vi.Mock).mockReturnValue({
      geoJsonDataMap: null,
      loading: false,
      error: null,
    })

    const { result } = renderHook(() => usePoiBasedGeoJsonMarkers())

    expect(useGeoJsonMarkers).toHaveBeenCalledWith([])
    expect(result.current.geoJsonDataMap).toBeNull()
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it("should call useGeoJsonMarkers with empty array if region selected but no categories", () => {
    ;(usePoiSelection as vi.Mock).mockReturnValue({
      selectedRegion: "test-region",
      selectedCategories: [],
    })
    ;(useGeoJsonMarkers as vi.Mock).mockReturnValue({
      geoJsonDataMap: null,
      loading: false,
      error: null,
    })

    renderHook(() => usePoiBasedGeoJsonMarkers())
    expect(useGeoJsonMarkers).toHaveBeenCalledWith([])
  })
  
  it("should call useGeoJsonMarkers with empty array if categories selected but no region", () => {
    ;(usePoiSelection as vi.Mock).mockReturnValue({
      selectedRegion: "",
      selectedCategories: ["cat1.json"],
    })
    ;(useGeoJsonMarkers as vi.Mock).mockReturnValue({
      geoJsonDataMap: null,
      loading: false,
      error: null,
    })

    renderHook(() => usePoiBasedGeoJsonMarkers())
    expect(useGeoJsonMarkers).toHaveBeenCalledWith([])
  })


  it("should construct correct file paths and call useGeoJsonMarkers", () => {
    const mockSelectedRegion = "test-region"
    const mockSelectedCategories = ["category1.json", "category2_data.json"]
    ;(usePoiSelection as vi.Mock).mockReturnValue({
      selectedRegion: mockSelectedRegion,
      selectedCategories: mockSelectedCategories,
    })

    const mockGeoJsonData = { data: "map-data" }
    const mockLoading = false
    const mockError = null
    ;(useGeoJsonMarkers as vi.Mock).mockReturnValue({
      geoJsonDataMap: mockGeoJsonData,
      loading: mockLoading,
      error: mockError,
    })

    const { result } = renderHook(() => usePoiBasedGeoJsonMarkers())

    const expectedPaths = [
      "/markers/test-region/category1.json",
      "/markers/test-region/category2_data.json",
    ]
    expect(useGeoJsonMarkers).toHaveBeenCalledWith(expectedPaths)
    expect(result.current.geoJsonDataMap).toEqual(mockGeoJsonData)
    expect(result.current.loading).toBe(mockLoading)
    expect(result.current.error).toBe(mockError)
  })

  it("should pass through loading and error states from useGeoJsonMarkers", () => {
    ;(usePoiSelection as vi.Mock).mockReturnValue({
      selectedRegion: "another-region",
      selectedCategories: ["data.json"],
    })
    ;(useGeoJsonMarkers as vi.Mock).mockReturnValue({
      geoJsonDataMap: null,
      loading: true,
      error: new Error("Failed to fetch"),
    })

    const { result } = renderHook(() => usePoiBasedGeoJsonMarkers())

    expect(result.current.loading).toBe(true)
    expect(result.current.error).toEqual(new Error("Failed to fetch"))
    expect(result.current.geoJsonDataMap).toBeNull()
  })
})
