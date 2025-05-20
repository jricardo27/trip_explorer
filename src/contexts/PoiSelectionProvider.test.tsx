import React, { ReactNode } from "react"
import { render, screen, act } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { PoiSelectionProvider, usePoiSelection } from "./PoiSelectionProvider.tsx" // Assuming PoiSelectionProvider exports usePoiSelection hook, or I'll import from PoiSelectionContext.ts
import { PoiSelectionContextType, CategoryInfo } from "./PoiSelectionContext.ts"

// Mock fetch
global.fetch = vi.fn()

const createFetchResponse = (data: any, ok = true) => {
  return { ok, json: () => new Promise((resolve) => resolve(data)) }
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
      <button onClick={() => context.setSelectedRegion("testRegion1")}>Set Region 1</button>
      <button onClick={() => context.setSelectedRegion("testRegion2")}>Set Region 2</button>
      <button onClick={() => context.setSelectedCategories(["cat1.json", "cat2.json"])}>
        Set Categories
      </button>
    </div>
  )
}

describe("PoiSelectionProvider", () => {
  beforeEach(() => {
    vi.resetAllMocks() // Reset mocks before each test
  })

  it("provides initial context values", () => {
    render(
      <PoiSelectionProvider>
        <TestConsumerComponent />
      </PoiSelectionProvider>,
    )
    expect(screen.getByTestId("selected-region").textContent).toBe("")
    expect(screen.getByTestId("available-categories").textContent).toBe("")
    expect(screen.getByTestId("selected-categories").textContent).toBe("")
  })

  it("updates selectedRegion when setSelectedRegion is called", () => {
    render(
      <PoiSelectionProvider>
        <TestConsumerComponent />
      </PoiSelectionProvider>,
    )
    act(() => {
      screen.getByText("Set Region 1").click()
    })
    expect(screen.getByTestId("selected-region").textContent).toBe("testRegion1")
  })

  it("fetches and updates availableCategories when selectedRegion changes", async () => {
    const mockManifestData = {
      files: ["categoryA.json", "categoryB_info.json"],
    }
    ;(fetch as vi.Mock).mockResolvedValue(createFetchResponse(mockManifestData))

    render(
      <PoiSelectionProvider>
        <TestConsumerComponent />
      </PoiSelectionProvider>,
    )

    await act(async () => {
      screen.getByText("Set Region 2").click()
    })

    expect(fetch).toHaveBeenCalledWith("/markers/testRegion2/manifest.json")
    expect(screen.getByTestId("selected-region").textContent).toBe("testRegion2")
    // Check for formatted names
    expect(screen.getByTestId("available-categories").textContent).toBe("CategoryA,CategoryB Info")
    // Selected categories should reset
    expect(screen.getByTestId("selected-categories").textContent).toBe("")
  })
  
  it("handles fetch error for manifest.json gracefully", async () => {
    ;(fetch as vi.Mock).mockResolvedValue(createFetchResponse({}, false)) // Simulate fetch error

    render(
      <PoiSelectionProvider>
        <TestConsumerComponent />
      </PoiSelectionProvider>,
    )

    await act(async () => {
      screen.getByText("Set Region 1").click()
    })
    
    expect(fetch).toHaveBeenCalledWith("/markers/testRegion1/manifest.json")
    expect(screen.getByTestId("available-categories").textContent).toBe("")
    expect(screen.getByTestId("selected-categories").textContent).toBe("")
  })


  it("updates selectedCategories when setSelectedCategories is called", () => {
    render(
      <PoiSelectionProvider>
        <TestConsumerComponent />
      </PoiSelectionProvider>,
    )
    act(() => {
      screen.getByText("Set Categories").click()
    })
    expect(screen.getByTestId("selected-categories").textContent).toBe("cat1.json,cat2.json")
  })
  
  it("resets available and selected categories if selectedRegion is set to empty", async () => {
    const mockManifestData = { files: ["categoryA.json"] }
    ;(fetch as vi.Mock).mockResolvedValue(createFetchResponse(mockManifestData))

    render(
      <PoiSelectionProvider>
        <TestConsumerComponent />
      </PoiSelectionProvider>,
    )

    // Set a region and categories
    await act(async () => {
      screen.getByText("Set Region 1").click() // This will fetch and populate availableCategories
    })
     act(() => {
      screen.getByText("Set Categories").click() // This sets selectedCategories
    })

    expect(screen.getByTestId("available-categories").textContent).toBe("CategoryA")
    expect(screen.getByTestId("selected-categories").textContent).toBe("cat1.json,cat2.json")

    // Reset region by simulating setSelectedRegion("")
    // Adding a button for this specific action in TestConsumer or directly calling from test
    const TestConsumerWithReset = () => {
        const context = usePoiSelection()
        return <button onClick={() => context.setSelectedRegion("")}>Reset Region</button>
    }
    render(
        <PoiSelectionProvider>
            <TestConsumerComponent /> {/* Render main consumer for assertions */}
            <TestConsumerWithReset /> {/* Render aux consumer for action */}
        </PoiSelectionProvider>
    )
    
    // Need to re-select elements if render is called again, or ensure single render context
    // For simplicity, assuming TestConsumerComponent is re-rendered within the same provider instance
    // or that state updates propagate correctly.
    // Re-rendering with a new provider instance as in this setup would reset state anyway.
    // The below logic implies that the TestConsumerComponent is within the *same* provider
    // as TestConsumerWithReset, which is not the case with multiple render calls.
    // A better approach is to have all actions in one TestConsumerComponent or use a ref.

    // Correct way: Ensure setSelectedRegion("") is callable on the *original* context
    // This test setup is a bit flawed for sequential inter-dependent state changes with multiple renders.
    // However, the provider's internal logic for `useEffect` on `selectedRegion` should handle it.
    
    // Let's re-render for this specific test to ensure clean state for action
    const TestConsumerWithAllActions = () => {
        const context = usePoiSelection()
        return (
          <div>
            <div data-testid="selected-region-all">{context.selectedRegion}</div>
            <div data-testid="available-categories-all">
              {context.availableCategories.map((cat) => cat.displayName).join(",")}
            </div>
            <div data-testid="selected-categories-all">{context.selectedCategories.join(",")}</div>
            <button onClick={() => context.setSelectedRegion("testRegion1")}>Set Region 1 All</button>
            <button onClick={() => context.setSelectedCategories(["cat1.json", "cat2.json"])}>Set Categories All</button>
            <button onClick={() => context.setSelectedRegion("")}>Reset Region All</button>
          </div>
        )
    }

    render(
        <PoiSelectionProvider>
            <TestConsumerWithAllActions />
        </PoiSelectionProvider>
    )
    
    await act(async () => {
      screen.getByText("Set Region 1 All").click()
    })
    act(() => {
      screen.getByText("Set Categories All").click()
    })

    expect(screen.getByTestId("available-categories-all").textContent).toBe("CategoryA")
    expect(screen.getByTestId("selected-categories-all").textContent).toBe("cat1.json,cat2.json")
    
    await act(async () => {
        screen.getByText("Reset Region All").click()
    })

    expect(screen.getByTestId("selected-region-all").textContent).toBe("")
    expect(screen.getByTestId("available-categories-all").textContent).toBe("")
    expect(screen.getByTestId("selected-categories-all").textContent).toBe("")

  })
})
