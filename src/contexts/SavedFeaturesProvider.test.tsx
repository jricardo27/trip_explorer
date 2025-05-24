import React from 'react';
import { renderHook, act } from '@testing-library/react';
import SavedFeaturesProvider, { SavedFeaturesContext, SavedFeaturesContextType, DEFAULT_CATEGORY } from './SavedFeaturesProvider'; // Adjust path as needed
import { GeoJsonFeature, SavedFeaturesStateType } from '../data/types'; // Adjust path
import { LineDefinition } from '../utils/idbUtils'; // Adjust path

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    length: 0, // Added length property
    key: (index: number) => null, // Added key method
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock idbUtils
jest.mock('../utils/idbUtils', () => ({
  getLinesFromDB: jest.fn(),
  addLineToDB: jest.fn(),
  updateLineInDB: jest.fn(),
  deleteLineFromDB: jest.fn(),
  clearLinesForProjectFromDB: jest.fn(),
}));

// Helper to wrap the hook and provider
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <SavedFeaturesProvider>{children}</SavedFeaturesProvider>
);

const samplePoi1: GeoJsonFeature = { type: "Feature", geometry: { type: "Point", coordinates: [0,0] }, properties: { id: "poi1", name: "POI 1" }};
const samplePoi2: GeoJsonFeature = { type: "Feature", geometry: { type: "Point", coordinates: [1,1] }, properties: { id: "poi2", name: "POI 2" }};

describe('SavedFeaturesProvider', () => {
  beforeEach(() => {
    localStorageMock.clear();
    // Reset mocks before each test
    (require('../utils/idbUtils').getLinesFromDB as jest.Mock).mockResolvedValue([]);
    (require('../utils/idbUtils').addLineToDB as jest.Mock).mockResolvedValue(undefined);
    (require('../utils/idbUtils').updateLineInDB as jest.Mock).mockResolvedValue(undefined);
    (require('../utils/idbUtils').deleteLineFromDB as jest.Mock).mockResolvedValue(undefined);
  });

  describe('Project Management', () => {
    it('initializes with a default project', () => {
      const { result } = renderHook(() => React.useContext(SavedFeaturesContext)!, { wrapper });
      expect(result.current?.currentProjectName).toBe('Default Project');
      expect(result.current?.projectNames).toEqual(['Default Project']);
    });

    it('creates a new project and switches to it', () => {
      const { result } = renderHook(() => React.useContext(SavedFeaturesContext)!, { wrapper });
      act(() => {
        result.current?.createNewProject('Test Project 1');
      });
      expect(result.current?.currentProjectName).toBe('Test Project 1');
      expect(result.current?.projectNames).toEqual(['Default Project', 'Test Project 1']);
    });

    it('does not create a project if name already exists', () => {
        const { result } = renderHook(() => React.useContext(SavedFeaturesContext)!, { wrapper });
        act(() => {
          result.current?.createNewProject('Default Project');
        });
        // Should remain on default, and not add duplicate
        expect(result.current?.currentProjectName).toBe('Default Project');
        expect(result.current?.projectNames).toEqual(['Default Project']);
      });

    it('switches between projects', () => {
      const { result } = renderHook(() => React.useContext(SavedFeaturesContext)!, { wrapper });
      act(() => {
        result.current?.createNewProject('Project Alpha');
      });
      act(() => {
        result.current?.createNewProject('Project Beta');
      });
      act(() => {
        result.current?.setCurrentProjectName('Project Alpha');
      });
      expect(result.current?.currentProjectName).toBe('Project Alpha');
    });

    it('persists project management state to localStorage', () => {
        renderHook(() => React.useContext(SavedFeaturesContext)!, { wrapper }); // initial render
        const { result: r2 } = renderHook(() => React.useContext(SavedFeaturesContext)!, { wrapper }); // to trigger actions
        act(() => {
            r2.current?.createNewProject('Persistent Project');
        });
        // Check localStorage content (simplified)
        const managementState = JSON.parse(localStorageMock.getItem('projectManagement_v1') || '{}');
        expect(managementState.currentProjectName).toBe('Persistent Project');
        expect(managementState.projectNames).toContain('Persistent Project');
    });

    it('loads project management state from localStorage on init', () => {
        // Pre-populate localStorage
        localStorageMock.setItem('projectManagement_v1', JSON.stringify({
          projectNames: ['Old Project', 'Current Old Project'],
          currentProjectName: 'Current Old Project'
        }));
        localStorageMock.setItem('projectsData_v1', JSON.stringify({ // Also need projectsData for consistency
            "Old Project": { [DEFAULT_CATEGORY]: [] },
            "Current Old Project": { [DEFAULT_CATEGORY]: [] }
        }));

        const { result } = renderHook(() => React.useContext(SavedFeaturesContext)!, { wrapper });
        expect(result.current?.currentProjectName).toBe('Current Old Project');
        expect(result.current?.projectNames).toEqual(['Old Project', 'Current Old Project']);
    });
  });

  describe('Feature (POI) Management with Projects', () => {
    it('adds features to the current project', () => {
      const { result } = renderHook(() => React.useContext(SavedFeaturesContext)!, { wrapper });
      act(() => {
        result.current?.createNewProject('Project X');
      });
      act(() => {
        result.current?.addFeature(DEFAULT_CATEGORY, samplePoi1);
      });
      expect(result.current?.savedFeatures[DEFAULT_CATEGORY]).toEqual([samplePoi1]);

      // Switch project and verify features are separate
      act(() => {
        result.current?.createNewProject('Project Y');
      });
      expect(result.current?.savedFeatures[DEFAULT_CATEGORY] || []).toEqual([]);
      act(() => {
        result.current?.addFeature(DEFAULT_CATEGORY, samplePoi2);
      });
      expect(result.current?.savedFeatures[DEFAULT_CATEGORY]).toEqual([samplePoi2]);

      // Switch back to Project X
      act(() => {
        result.current?.setCurrentProjectName('Project X');
      });
      expect(result.current?.savedFeatures[DEFAULT_CATEGORY]).toEqual([samplePoi1]);
    });
    
    it('persists features for each project in localStorage', () => {
        const { result } = renderHook(() => React.useContext(SavedFeaturesContext)!, { wrapper });
        act(() => { result.current?.createNewProject('Project P1'); });
        act(() => { result.current?.addFeature(DEFAULT_CATEGORY, samplePoi1); });
        act(() => { result.current?.createNewProject('Project P2'); });
        act(() => { result.current?.addFeature(DEFAULT_CATEGORY, samplePoi2); });

        const projectsData = JSON.parse(localStorageMock.getItem('projectsData_v1') || '{}');
        expect(projectsData['Project P1'][DEFAULT_CATEGORY]).toEqual([samplePoi1]);
        expect(projectsData['Project P2'][DEFAULT_CATEGORY]).toEqual([samplePoi2]);
    });
  });

  describe('Line Data Management (with mocked IndexedDB)', () => {
    const sampleLine: LineDefinition = { id: 'line1', name: 'My Route', projectName: 'Default Project', poiIds: ['poi1', 'poi2'] };

    it('loads lines for the current project on project switch', async () => {
      const { result, rerender } = renderHook(() => React.useContext(SavedFeaturesContext)!, { wrapper });
      
      (require('../utils/idbUtils').getLinesFromDB as jest.Mock).mockResolvedValueOnce([sampleLine]);
      
      act(() => {
        result.current?.createNewProject('ProjectWithLines');
      });

      // Wait for effects to run - getLinesFromDB is async
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0)); // Allow microtasks to flush
      });
      
      expect(require('../utils/idbUtils').getLinesFromDB).toHaveBeenCalledWith('ProjectWithLines');
      expect(result.current?.currentProjectLines).toEqual([sampleLine]);
    });

    it('adds a new line to the current project and updates context', async () => {
      const { result } = renderHook(() => React.useContext(SavedFeaturesContext)!, { wrapper }); // Starts with 'Default Project'
      
      await act(async () => {
        await result.current?.addNewLine('New Test Line', ['poiA', 'poiB']);
      });
      
      expect(require('../utils/idbUtils').addLineToDB).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'New Test Line',
          poiIds: ['poiA', 'poiB'],
          projectName: 'Default Project', // ensure it's for the current project
        })
      );
      expect(result.current?.currentProjectLines.length).toBe(1);
      expect(result.current?.currentProjectLines[0].name).toBe('New Test Line');
    });

    it('updates an existing line', async () => {
        const { result } = renderHook(() => React.useContext(SavedFeaturesContext)!, { wrapper });
        let addedLine: LineDefinition | undefined;
        
        await act(async () => { // Add a line first
          await result.current?.addNewLine('Initial Line', ['id1']);
          addedLine = result.current?.currentProjectLines[0];
        });

        expect(addedLine).toBeDefined();
        if (!addedLine) return;

        const updatedLine: LineDefinition = { ...addedLine, name: 'Updated Line Name', poiIds: ['id1', 'id2'] };
        
        await act(async () => {
          await result.current?.updateExistingLine(updatedLine);
        });

        expect(require('../utils/idbUtils').updateLineInDB).toHaveBeenCalledWith(updatedLine);
        expect(result.current?.currentProjectLines.find(l => l.id === addedLine!.id)?.name).toBe('Updated Line Name');
    });

    it('deletes an existing line', async () => {
        const { result } = renderHook(() => React.useContext(SavedFeaturesContext)!, { wrapper });
        let lineToDeleteId: string | undefined;

        await act(async () => {
            await result.current?.addNewLine('Line to Delete', ['p1']);
            lineToDeleteId = result.current?.currentProjectLines[0]?.id;
        });
        expect(lineToDeleteId).toBeDefined();
        expect(result.current?.currentProjectLines.length).toBe(1);

        await act(async () => {
            await result.current?.deleteExistingLine(lineToDeleteId!);
        });
        expect(require('../utils/idbUtils').deleteLineFromDB).toHaveBeenCalledWith(lineToDeleteId);
        expect(result.current?.currentProjectLines.length).toBe(0);
    });
  });
});

// Ensure all imports and types are correct if copy-pasting.
// For instance, SavedFeaturesContextType might need explicit import if not re-exported by Provider file.
// GeoJsonFeature, SavedFeaturesStateType, LineDefinition need correct paths.
// DEFAULT_CATEGORY needs to be available.
// The mock for idbUtils should correctly cover all functions used by the provider.
// The localStorage mock needs to be complete for all methods used (getItem, setItem, clear, etc.)
// The wrapper needs to correctly set up the provider for the hook.
// Async operations and state updates need `act` and potentially waiting for promises.
// When testing `addNewLine`, the generated ID is random, so use `expect.objectContaining` for the call to `addLineToDB`.
// Test for `updateExistingLine` should ensure it only updates if `line.projectName` matches `currentProjectName`. (This logic is in provider).
// Test for `loadLinesForCurrentProject` (implicitly tested via project switch) should clear lines if DB call fails or project has no lines.
// Test `clearLinesForProjectFromDB` is called during project deletion if that feature is added. (Not part of this test suite yet).
// Test that `loadFromLocalStorage` correctly initializes project POIs.
// Test that `createNewProject` also clears `currentProjectLines` (or relies on the effect to do so).
// The test for `localStorage` persistence of project management state might need to ensure `JSON.stringify` is correctly handled.
// Test for `loadFromLocalStorage` when `localStorage` is empty should result in default project setup.
// Test for `updateFeature` and `removeFeature` in context of projects.
// Test for `setSavedFeatures` (aka `loadDataIntoCurrentProject`) with projects.
// Test `saveToLocalStorage` is called appropriately.
// Test `loadFromLocalStorage` is called on init.
// Add `length` and `key` to localStorage mock.
// Ensure `DEFAULT_CATEGORY` is correctly handled in POI tests.
// Ensure mock for `getLinesFromDB` is reset or handled for different project switches.
// Test `updateExistingLine`'s guard against updating line not belonging to current project.
//    (This is handled by the test structure: add line, then update. It will belong to current project).
// Test `addNewLine`'s guard if `currentProjectName` is not set. (Not easily testable without manipulating provider internals, but good to note).
// Test `createNewProject` also initializes project data in `allProjectsData`. (Implicitly tested by feature management tests).
// Test that `loadFromLocalStorage` correctly initializes `allProjectsData` and `projectManagement` state.
//    (Covered by `loads project management state from localStorage on init` and feature persistence tests)
// Final check on async actions in tests, especially for line management. Use `await act(async () => { ... })` for state updates after async calls.
// `rerender` might be needed if testing effects that run on prop changes, but here we mostly test context functions.
// `(require('../utils/idbUtils').getLinesFromDB as jest.Mock).mockResolvedValueOnce([sampleLine]);` is good for specific call responses.
//    Use `mockClear()` or `mockReset()` on jest.Mock functions in `beforeEach` if their call history matters across tests.
//    `mockResolvedValue([])` in `beforeEach` sets a default for `getLinesFromDB`.
// Check `addNewLine` in provider - it calls `uuidv4()`. Test should verify `addLineToDB` gets an ID.
//    (Covered by `expect.objectContaining({ id: expect.any(String) ...})` if we were checking the ID, but we check name, poiIds, projectName)
//    The `id` is generated by `uuidv4` in the provider, so `addLineToDB` receives it.
// The `localStorage` mock needs `length` and `key` properties for full API compatibility if any library iterates over it, though direct `getItem`/`setItem` is more common. (Added)
// The `localStorageMock.clear()` in `beforeEach` is good.
// `(require('../utils/idbUtils').getLinesFromDB as jest.Mock).mockClear()` etc. in `beforeEach` is good for call count verification if needed.
// For `loadLinesForCurrentProject` (tested via project switch), ensure the mock for `getLinesFromDB` is set up *before* the action that triggers the load.
// The `await act(async () => { await new Promise(resolve => setTimeout(resolve, 0)); });` is a common way to wait for promises within `useEffect` to resolve and subsequent state updates to process.
// The test "loads lines for the current project on project switch" correctly uses this pattern.
// The test "adds a new line..." also correctly uses `await act(async () => { ... })`.
// Same for update and delete tests.
// The POI management tests for adding features and persistence look okay.
// The project management tests for creation, switching, and persistence look okay.
// Overall, this seems like a solid start for testing `SavedFeaturesProvider`.Okay, this is a good start for `SavedFeaturesProvider.test.tsx`. I've added the `localStorage` mock and the `idbUtils` mock, along with tests for project management, feature management within projects, and line data management.

Here are some refinements and things to keep in mind, largely based on your extensive comments:

*   **`localStorageMock.clear()` and `jest.clearAllMocks()`:** It's good practice to clear mocks and localStorage before each test to ensure test isolation. `jest.clearAllMocks()` is useful for resetting call counts and mock implementations.
*   **Async nature of `useEffect` for loading lines:** The test "loads lines for the current project on project switch" correctly uses `await act(async () => { await new Promise(resolve => setTimeout(resolve, 0)); });` to wait for the `useEffect` that calls `getLinesFromDB` to complete. This is crucial.
*   **ID Generation in `addNewLine`:** The tests for `addNewLine` correctly use `expect.objectContaining` because the `id` is generated internally by `uuidv4()` in the provider. We care that the other properties are correct and that *an* ID is passed to `addLineToDB`.
*   **Testing `updateExistingLine`'s project check:** The current test for `updateExistingLine` implicitly tests the success case. To test the guard `if (line.projectName !== projectManagement.currentProjectName)`, you'd need to:
    1.  Create Project A, add a line.
    2.  Create Project B, switch to it.
    3.  Try to update the line from Project A while Project B is active. `updateLineInDB` should not be called. This is a more advanced scenario but good for completeness.
*   **Completeness of `idbUtils` Mocking:** Ensure all functions from `idbUtils` that are actually used by the provider are mocked. The current set seems to cover it.
*   **`DEFAULT_CATEGORY` handling:** The POI tests should ensure that when a new project is created, it correctly initializes with an empty `DEFAULT_CATEGORY` (or whatever the default structure is).

The current set of tests provides good coverage for the core functionalities.

Now, let's proceed to **`TopMenu.test.tsx`**.
I'll focus on:
1.  Mocking `SavedFeaturesContext`.
2.  Testing the "Create New Project" interaction (mocking `prompt`).
3.  Testing the project switching interaction.
4.  Testing the "Import" functionality, especially how it interacts with the (mocked) context functions for POIs and Lines. This will be the most complex part.
