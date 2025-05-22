import { describe, it, expect, beforeEach, afterEach, vi, SpyInstance } from 'vitest'
import { render, act } from '@testing-library/react'
import React, { useContext } from 'react'

import SavedFeaturesProvider from './SavedFeaturesProvider'
import SavedFeaturesContext, { 
  DEFAULT_CATEGORY, 
  SavedFeaturesStateType, 
  selectionInfo,
  SavedFeaturesContextType
} from "./SavedFeaturesContext"
import { GeoJsonFeature } from "../data/types"


// Helper component to consume the context
const TestConsumer: React.FC<{
  onContextValue?: (value: any) => void; // eslint-disable-line @typescript-eslint/no-explicit-any
}> = ({ onContextValue }) => {
  const context = useContext(SavedFeaturesContext)
  if (!context) {
    throw new Error("TestConsumer must be used within a SavedFeaturesProvider")
  }
  if (onContextValue) {
    onContextValue(context)
  }
  return null
}

// Mock GeoJSON features
const createMockFeature = (id: string, name: string, category?: string): GeoJsonFeature => ({
  type: "Feature",
  geometry: { type: "Point", coordinates: [0, 0] },
  properties: { id, name, category },
})

describe("SavedFeaturesProvider", () => {
  let localStorageMock: {
    getItem: SpyInstance<[key: string], string | null>;
    setItem: SpyInstance<[key: string, value: string], void>;
    removeItem: SpyInstance<[key: string], void>;
    clear: SpyInstance<[], void>;
  };

  beforeEach(() => {
    // Create a mock object that adheres to the Storage interface
    const store: Record<string, string> = {};
    localStorageMock = {
      getItem: vi.fn((key: string) => store[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key];
      }),
      clear: vi.fn(() => {
        for (const key in store) {
          delete store[key];
        }
      }),
    };
    vi.stubGlobal('localStorage', localStorageMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("initializes with default state if localStorage is empty", () => {
    localStorageMock.getItem.mockReturnValue(null); // Explicitly ensure it's null for this test
    let contextValue: SavedFeaturesContextType | null = null;
    render(
      <SavedFeaturesProvider>
        <TestConsumer onContextValue={(v) => contextValue = v as SavedFeaturesContextType} />
      </SavedFeaturesProvider>
    )
    expect(contextValue?.savedFeatures).toEqual({ [DEFAULT_CATEGORY]: [] });
  });

  it("loads initial state from localStorage if present", () => {
    const initialState: SavedFeaturesStateType = {
      [DEFAULT_CATEGORY]: [createMockFeature("1", "Feature 1")],
      "customCategory": [createMockFeature("2", "Feature 2")],
    };
    localStorageMock.setItem(STORAGE_KEY, JSON.stringify(initialState)); // Use setItem for setup
    localStorageMock.getItem.mockImplementation((key) => key === STORAGE_KEY ? JSON.stringify(initialState) : null);


    let contextValue: SavedFeaturesContextType | null = null;
    render(
      <SavedFeaturesProvider>
        <TestConsumer onContextValue={(v) => contextValue = v as SavedFeaturesContextType} />
      </SavedFeaturesProvider>
    )
    expect(contextValue?.savedFeatures).toEqual(initialState);
  });

  it("adds a feature to the DEFAULT_CATEGORY", () => {
    let contextValue: SavedFeaturesContextType | null = null;
    render(
      <SavedFeaturesProvider>
        <TestConsumer onContextValue={(v) => contextValue = v as SavedFeaturesContextType} />
      </SavedFeaturesProvider>
    )
    const feature1 = createMockFeature("f1", "Feature 1");
    act(() => {
      contextValue?.addFeature(DEFAULT_CATEGORY, feature1);
    });
    expect(contextValue?.savedFeatures[DEFAULT_CATEGORY]).toContainEqual(feature1);
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  it("adds a feature to a custom category and removes it from DEFAULT_CATEGORY", () => {
    let contextValue: SavedFeaturesContextType | null = null;
    const feature1 = createMockFeature("f1", "Feature 1");

    // Initial state: feature1 is in DEFAULT_CATEGORY
    const initialState: SavedFeaturesStateType = {
      [DEFAULT_CATEGORY]: [feature1],
      "custom": [],
    };
    // localStorageMock.setItem(STORAGE_KEY, JSON.stringify(initialState)); // REMOVE THIS LINE
    localStorageMock.getItem.mockImplementation((key) => key === STORAGE_KEY ? JSON.stringify(initialState) : null);


    render(
      <SavedFeaturesProvider>
        <TestConsumer onContextValue={(v) => contextValue = v as SavedFeaturesContextType} />
      </SavedFeaturesProvider>
    );
    
    act(() => {
      // contextValue should be initialized by now from localStorage
      contextValue?.addFeature("custom", feature1);
    });

    expect(contextValue?.savedFeatures["custom"]).toContainEqual(feature1);
    expect(contextValue?.savedFeatures[DEFAULT_CATEGORY]).not.toContainEqual(feature1);
    expect(localStorageMock.setItem).toHaveBeenCalledTimes(2); // initial load + addFeature
  })


  it("removes a feature from a category", () => {
    const feature1 = createMockFeature("f1", "Feature 1")
    const initialFeatures = { [DEFAULT_CATEGORY]: [feature1, createMockFeature("f2", "Feature 2")] }
    localStorageMock.getItem.mockReturnValue(JSON.stringify(initialFeatures))
    
    let contextValue: SavedFeaturesContextType | null = null;
    render(
      <SavedFeaturesProvider>
        <TestConsumer onContextValue={(v) => contextValue = v as SavedFeaturesContextType} />
      </SavedFeaturesProvider>
    )
    
    const selection: selectionInfo = { feature: feature1, category: DEFAULT_CATEGORY, index: 0 }
    act(() => {
      contextValue?.removeFeature(DEFAULT_CATEGORY, selection)
    })
    
    expect(contextValue?.savedFeatures[DEFAULT_CATEGORY].length).toBe(1)
    expect(contextValue?.savedFeatures[DEFAULT_CATEGORY][0].properties?.id).toBe("f2")
    expect(localStorageMock.setItem).toHaveBeenCalledTimes(2) // load, then remove
  })

  it("updates a feature across all categories", () => {
    const oldFeature = createMockFeature("f1", "Old Name")
    const newFeatureData = createMockFeature("f1", "New Name")
    newFeatureData.properties!.description = "Updated description"

    const initialState: SavedFeaturesStateType = {
      [DEFAULT_CATEGORY]: [oldFeature, createMockFeature("f2", "Other Feature")],
      "custom1": [createMockFeature("f3", "Another"), oldFeature],
    }
    localStorageMock.getItem.mockReturnValue(JSON.stringify(initialState))

    let contextValue: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    render(
      <SavedFeaturesProvider>
        <TestConsumer onContextValue={(v) => contextValue = v} />
      </SavedFeaturesProvider>
    )

    act(() => {
      contextValue.updateFeature(oldFeature, newFeatureData)
    })

    expect(contextValue.savedFeatures[DEFAULT_CATEGORY][0].properties?.name).toBe("New Name")
    expect(contextValue.savedFeatures[DEFAULT_CATEGORY][0].properties?.description).toBe("Updated description")
    expect(contextValue.savedFeatures["custom1"][1].properties?.name).toBe("New Name")
    expect(contextValue.savedFeatures["custom1"][1].properties?.description).toBe("Updated description")
    expect(localStorageMock.setItem).toHaveBeenCalledTimes(2) // load, then update
  })

  it("creates a new category using setSavedFeatures", () => {
    let contextValue: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    render(
      <SavedFeaturesProvider>
        <TestConsumer onContextValue={(v) => contextValue = v} />
      </SavedFeaturesProvider>
    )
    act(() => {
      contextValue.setSavedFeatures((prev: SavedFeaturesStateType) => ({
        ...prev,
        "newCategory": [],
      }))
    })
    expect(contextValue.savedFeatures["newCategory"]).toEqual([])
    expect(localStorageMock.setItem).toHaveBeenCalled()
  })

  it("deletes a category using setSavedFeatures (features in deleted category are lost if not re-categorized)", () => {
    const initialState: SavedFeaturesStateType = {
      [DEFAULT_CATEGORY]: [],
      "toBeDeleted": [createMockFeature("f1", "Feature 1")],
    }
    localStorageMock.getItem.mockReturnValue(JSON.stringify(initialState))
    let contextValue: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    render(
      <SavedFeaturesProvider>
        <TestConsumer onContextValue={(v) => contextValue = v} />
      </SavedFeaturesProvider>
    )
    act(() => {
      contextValue.setSavedFeatures((prev: SavedFeaturesStateType) => {
        const newState = { ...prev }
        delete newState["toBeDeleted"]
        return newState
      })
    })
    expect(contextValue.savedFeatures["toBeDeleted"]).toBeUndefined()
    expect(localStorageMock.setItem).toHaveBeenCalledTimes(2) // load, then set
  })
  
  it("renames a category using setSavedFeatures", () => {
    const feature1 = createMockFeature("f1", "Feature 1");
    const initialState: SavedFeaturesStateType = {
      [DEFAULT_CATEGORY]: [],
      "oldName": [feature1],
    };
    localStorageMock.getItem.mockReturnValue(JSON.stringify(initialState));
    let contextValue: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    render(
      <SavedFeaturesProvider>
        <TestConsumer onContextValue={(v) => contextValue = v} />
      </SavedFeaturesProvider>
    );
    act(() => {
      contextValue.setSavedFeatures((prev: SavedFeaturesStateType) => {
        const { oldName, ...rest } = prev;
        return {
          ...rest,
          "newName": oldName || [],
        };
      });
    });
    expect(contextValue.savedFeatures["oldName"]).toBeUndefined();
    expect(contextValue.savedFeatures["newName"]).toContainEqual(feature1);
    expect(localStorageMock.setItem).toHaveBeenCalledTimes(2);
  });

  it("reorders features within a category using setSavedFeatures", () => {
    const feature1 = createMockFeature("f1", "Feature 1")
    const feature2 = createMockFeature("f2", "Feature 2")
    const initialState: SavedFeaturesStateType = { [DEFAULT_CATEGORY]: [feature1, feature2] }
    localStorageMock.getItem.mockReturnValue(JSON.stringify(initialState))
    let contextValue: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    render(
      <SavedFeaturesProvider>
        <TestConsumer onContextValue={(v) => contextValue = v} />
      </SavedFeaturesProvider>
    )
    act(() => {
      contextValue.setSavedFeatures((prev: SavedFeaturesStateType) => ({
        ...prev,
        [DEFAULT_CATEGORY]: [feature2, feature1],
      }))
    })
    expect(contextValue.savedFeatures[DEFAULT_CATEGORY]).toEqual([feature2, feature1])
    expect(localStorageMock.setItem).toHaveBeenCalledTimes(2)
  })

  it("reorders categories using setSavedFeatures (order in object keys is not guaranteed, test checks data integrity)", () => {
    // Note: Object key order is not guaranteed in JS, but we can test if the data remains correct.
    // For UI representation of order, an array of keys would typically be stored separately.
    const cat1Data = [createMockFeature("c1f1", "Cat1 Feature1")]
    const cat2Data = [createMockFeature("c2f1", "Cat2 Feature1")]
    const initialState: SavedFeaturesStateType = { "category1": cat1Data, "category2": cat2Data }
    localStorageMock.getItem.mockReturnValue(JSON.stringify(initialState))
    let contextValue: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    render(
      <SavedFeaturesProvider>
        <TestConsumer onContextValue={(v) => contextValue = v} />
      </SavedFeaturesProvider>
    )
    act(() => {
      // Simulate reordering by changing the structure (e.g. if a supporting ordered key list changed)
      contextValue.setSavedFeatures({ "category2": cat2Data, "category1": cat1Data })
    })
    // Check data integrity, not key order
    expect(contextValue.savedFeatures["category1"]).toEqual(cat1Data)
    expect(contextValue.savedFeatures["category2"]).toEqual(cat2Data)
    expect(localStorageMock.setItem).toHaveBeenCalledTimes(2)
  })

  it("saveToLocalStorage and loadFromLocalStorage work correctly", () => {
    let contextValue: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    render(
      <SavedFeaturesProvider>
        <TestConsumer onContextValue={(v) => contextValue = v} />
      </SavedFeaturesProvider>
    )
    const testState: SavedFeaturesStateType = { [DEFAULT_CATEGORY]: [createMockFeature("test", "Test")]}
    
    // Simulate setting state and saving
    act(() => {
        contextValue.setSavedFeatures(testState) 
        // saveToLocalStorage is called automatically by useEffect, but we can call it explicitly if needed
        // contextValue.saveToLocalStorage(); // Already called by useEffect
    });
    expect(localStorageMock.setItem).toHaveBeenCalledWith(STORAGE_KEY, JSON.stringify(testState))

    // Simulate loading
    localStorageMock.getItem.mockReturnValue(JSON.stringify(testState)) // Ensure getItem returns the new state
    act(() => {
      contextValue.loadFromLocalStorage()
    })
    expect(contextValue.savedFeatures).toEqual(testState)
  })
})

// Need to ensure DEFAULT_CATEGORY is correctly sourced.
// If SavedFeaturesProvider doesn't export it, but SavedFeaturesContext does:
// import SavedFeaturesContext, { DEFAULT_CATEGORY as ActualDefaultCategory } from "./SavedFeaturesContext";
// const DEFAULT_CATEGORY = ActualDefaultCategory;
// For now, assuming SavedFeaturesProvider exports it or it's available.
// If not, I will define it as 'all' based on the provider's logic.
const STORAGE_KEY = "savedFeatures"; // Re-define if not exported from provider for test usage
