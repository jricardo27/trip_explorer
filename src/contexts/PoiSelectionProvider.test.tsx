import React from "react"
import { render, screen, act, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { PoiSelectionProvider, usePoiSelection } from "./PoiSelectionProvider.tsx"
import { RegionInfo } from "./PoiSelectionContext.ts" // Import RegionInfo

// Mock fetch
global.fetch = vi.fn()

const mockRegionsData: RegionInfo[] = [
  { id: "testRegion1", name: "Test Region 1" },
  { id: "testRegion2", name: "Test Region 2" },
]

const mockCategoryManifestData = (regionId: string) => ({
  files: [`${regionId}_catA.json`, `${regionId}_catB.json`],
})

const createFetchResponse = (data: any, ok = true) => {
  return Promise.resolve({ ok, json: () => Promise.resolve(data) })
}

// Test component to consume the context
const TestConsumerComponent = () => {
  const context = usePoiSelection()
  if (!context) return null
  return (
    <div>
      <div data-testid="selected-region">{context.selectedRegion}</div>
      <div data-testid="available-categories">
        {context.availableCategories.map((cat) => cat.displayName).join(",")}
      </div>
      <div data-testid="selected-categories">{context.selectedCategories.join(",")}</div>
      <div data-testid="regions-list">
        {context.regions.map((reg) => reg.name).join(",")}
      </div>
      <button onClick={() => context.setSelectedRegion("testRegion1")}>Set Region TestRegion1</button>
      <button onClick={() => context.setSelectedRegion("testRegion2")}>Set Region TestRegion2</button>
      <button onClick={() => context.setSelectedCategories(["cat1.json", "cat2.json"])}>
        Set Selected Categories
      </button>
      <button onClick={() => context.setSelectedRegion("")}>Reset Region Selection</button>
    </div>
  )
}

describe("PoiSelectionProvider", () => {
  let consoleErrorSpy: vi.SpyInstance

  beforeEach(() => {
    vi.resetAllMocks() // Reset mocks before each test
    // Spy on console.error
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {})

    // Default fetch mock behavior
    ;(fetch as vi.Mock).mockImplementation((url: string) => {
      if (url === "/markers/regions-manifest.json") {
        return createFetchResponse(mockRegionsData)
      }
      if (url.includes("/manifest.json")) {
        // Extract regionId from URL like "/markers/testRegion1/manifest.json"
        const regionId = url.split("/")[2]
        return createFetchResponse(mockCategoryManifestData(regionId))
      }
      return createFetchResponse({}, false) // Default to error for unexpected fetches
    })
  })

  afterEach(() => {
    // Restore console.error
    consoleErrorSpy.mockRestore()
  })

  it("provides initial context values including empty regions", () => {
    render(
      <PoiSelectionProvider>
        <TestConsumerComponent />
      </PoiSelectionProvider>,
    )
    expect(screen.getByTestId("selected-region").textContent).toBe("")
    expect(screen.getByTestId("available-categories").textContent).toBe("")
    expect(screen.getByTestId("selected-categories").textContent).toBe("")
    expect(screen.getByTestId("regions-list").textContent).toBe("") // Initially empty before fetch
  })
  
  it("fetches and populates regions list on mount", async () => {
    render(
      <PoiSelectionProvider>
        <TestConsumerComponent />
      </PoiSelectionProvider>,
    )
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/markers/regions-manifest.json")
      expect(screen.getByTestId("regions-list").textContent).toBe("Test Region 1,Test Region 2")
    })
  })

  it("handles fetch error for regions-manifest.json gracefully", async () => {
    ;(fetch as vi.Mock).mockImplementation((url: string) => {
      if (url === "/markers/regions-manifest.json") {
        return createFetchResponse({}, false); // Simulate fetch error for regions
      }
      return createFetchResponse(mockCategoryManifestData("any")); // Other fetches succeed
    });
  
    render(
      <PoiSelectionProvider>
        <TestConsumerComponent />
      </PoiSelectionProvider>,
    )
  
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/markers/regions-manifest.json")
      expect(screen.getByTestId("regions-list").textContent).toBe("")
      expect(consoleErrorSpy).toHaveBeenCalledWith("Error fetching regions-manifest.json:", expect.any(Error))
    })
  })


  it("updates selectedRegion when setSelectedRegion is called", async () => {
    render(
      <PoiSelectionProvider>
        <TestConsumerComponent />
      </PoiSelectionProvider>,
    )
    await waitFor(() => expect(fetch).toHaveBeenCalledWith("/markers/regions-manifest.json")); // Ensure regions are loaded first

    act(() => {
      screen.getByText("Set Region TestRegion1").click()
    })
    expect(screen.getByTestId("selected-region").textContent).toBe("testRegion1")
  })

  it("fetches and updates availableCategories when selectedRegion changes", async () => {
    render(
      <PoiSelectionProvider>
        <TestConsumerComponent />
      </PoiSelectionProvider>,
    )
    await waitFor(() => expect(fetch).toHaveBeenCalledWith("/markers/regions-manifest.json")); // Wait for regions to load

    await act(async () => {
      screen.getByText("Set Region TestRegion2").click()
    })

    // Now wait for category manifest fetch
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/markers/testRegion2/manifest.json")
    })

    expect(screen.getByTestId("selected-region").textContent).toBe("testRegion2")
    expect(screen.getByTestId("available-categories").textContent).toBe("TestRegion2 CatA,TestRegion2 CatB")
    expect(screen.getByTestId("selected-categories").textContent).toBe("") // Should reset
  })
  
  it("handles fetch error for category manifest.json gracefully", async () => {
    ;(fetch as vi.Mock).mockImplementation((url: string) => {
        if (url === "/markers/regions-manifest.json") {
          return createFetchResponse(mockRegionsData)
        }
        if (url.includes("/manifest.json")) {
          return createFetchResponse({}, false); // Simulate category fetch error
        }
        return createFetchResponse({}, false)
      })

    render(
      <PoiSelectionProvider>
        <TestConsumerComponent />
      </PoiSelectionProvider>,
    )
    await waitFor(() => expect(fetch).toHaveBeenCalledWith("/markers/regions-manifest.json"));

    await act(async () => {
      screen.getByText("Set Region TestRegion1").click()
    })

    await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith("/markers/testRegion1/manifest.json")
    })
    
    expect(screen.getByTestId("available-categories").textContent).toBe("")
    expect(screen.getByTestId("selected-categories").textContent).toBe("")
    expect(consoleErrorSpy).toHaveBeenCalledWith("Error fetching manifest.json:", expect.any(Error))
  })

  it("updates selectedCategories when setSelectedCategories is called", async () => {
    render(
      <PoiSelectionProvider>
        <TestConsumerComponent />
      </PoiSelectionProvider>,
    )
    await waitFor(() => expect(fetch).toHaveBeenCalledWith("/markers/regions-manifest.json"));

    act(() => {
      screen.getByText("Set Selected Categories").click()
    })
    expect(screen.getByTestId("selected-categories").textContent).toBe("cat1.json,cat2.json")
  })
  
  it("resets available and selected categories if selectedRegion is set to empty", async () => {
    render(
      <PoiSelectionProvider>
        <TestConsumerComponent />
      </PoiSelectionProvider>,
    )
    await waitFor(() => expect(fetch).toHaveBeenCalledWith("/markers/regions-manifest.json"));

    // Set a region and categories
    await act(async () => {
      screen.getByText("Set Region TestRegion1").click()
    })
    await waitFor(() => expect(fetch).toHaveBeenCalledWith("/markers/testRegion1/manifest.json"));
    
    act(() => {
      screen.getByText("Set Selected Categories").click()
    })

    expect(screen.getByTestId("available-categories").textContent).toBe("TestRegion1 CatA,TestRegion1 CatB")
    expect(screen.getByTestId("selected-categories").textContent).toBe("cat1.json,cat2.json")
    
    // Reset region
    await act(async () => { // Ensure any potential async operations from setSelectedRegion complete
        screen.getByText("Reset Region Selection").click()
    })

    expect(screen.getByTestId("selected-region").textContent).toBe("")
    expect(screen.getByTestId("available-categories").textContent).toBe("")
    expect(screen.getByTestId("selected-categories").textContent).toBe("")
  })
})
