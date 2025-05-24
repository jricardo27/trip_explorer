import React, { useState, useCallback, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"

import { GeoJsonFeature } from "../data/types"
import idxFeat, { idxSel } from "../utils/idxFeat"
import { LineDefinition, addLineToDB, getLinesFromDB, updateLineInDB, deleteLineFromDB } from "../utils/idbUtils" // Added

import SavedFeaturesContext, { DEFAULT_CATEGORY, SavedFeaturesContextType, SavedFeaturesStateType, selectionInfo } from "./SavedFeaturesContext"

interface SavedFeaturesProviderProps {
  children: React.ReactNode
}

const PROJECTS_DATA_STORAGE_KEY = "projectsData_v1" // Stores all features for all projects
const PROJECT_MANAGEMENT_STORAGE_KEY = "projectManagement_v1" // Stores project names and current project

const DEFAULT_PROJECT_NAME = "Default Project"

// Type for all features across all projects
type AllProjectsDataStateType = {
  [projectName: string]: SavedFeaturesStateType
}

// Type for project management state
type ProjectManagementStateType = {
  projectNames: string[]
  currentProjectName: string
}

const SavedFeaturesProvider: React.FC<SavedFeaturesProviderProps> = ({ children }) => {
  // State for all features in all projects
  const [allProjectsData, setAllProjectsDataState] = useState<AllProjectsDataStateType>(() => {
    const storedProjectsData = localStorage.getItem(PROJECTS_DATA_STORAGE_KEY)
    if (storedProjectsData) {
      return JSON.parse(storedProjectsData)
    }
    return {
      [DEFAULT_PROJECT_NAME]: { [DEFAULT_CATEGORY]: [] },
    }
  })

  // State for project names and the current project
  const [projectManagement, setProjectManagementState] = useState<ProjectManagementStateType>(() => {
    const storedManagementData = localStorage.getItem(PROJECT_MANAGEMENT_STORAGE_KEY)
    if (storedManagementData) {
      return JSON.parse(storedManagementData)
    }
    return {
      projectNames: [DEFAULT_PROJECT_NAME],
      currentProjectName: DEFAULT_PROJECT_NAME,
    }
  })

  // State for lines/routes of the current project
  const [currentProjectLines, setCurrentProjectLines] = useState<LineDefinition[]>([])

  // Save all data to local storage (project features and management state)
  // Line data is in IndexedDB, not local storage directly with features.
  const saveToLocalStorage = useCallback(() => {
    localStorage.setItem(PROJECTS_DATA_STORAGE_KEY, JSON.stringify(allProjectsData))
    localStorage.setItem(PROJECT_MANAGEMENT_STORAGE_KEY, JSON.stringify(projectManagement))
  }, [allProjectsData, projectManagement])

  // Load project features and management state from local storage
  const loadFromLocalStorage = useCallback(() => {
    const storedProjectsData = localStorage.getItem(PROJECTS_DATA_STORAGE_KEY)
    const storedManagementData = localStorage.getItem(PROJECT_MANAGEMENT_STORAGE_KEY)

    if (storedProjectsData) {
      setAllProjectsDataState(JSON.parse(storedProjectsData))
    } else {
      // Initialize if no project data
      setAllProjectsDataState({ [DEFAULT_PROJECT_NAME]: { [DEFAULT_CATEGORY]: [] } })
    }

    if (storedManagementData) {
      setProjectManagementState(JSON.parse(storedManagementData))
    } else {
      // Initialize if no management data
      const initialProjectName = storedProjectsData ? Object.keys(JSON.parse(storedProjectsData))[0] || DEFAULT_PROJECT_NAME : DEFAULT_PROJECT_NAME
      setProjectManagementState({
        projectNames: [initialProjectName],
        currentProjectName: initialProjectName,
      })
    }
  }, [])

  // Effect to save to local storage whenever relevant data changes
  useEffect(() => {
    saveToLocalStorage()
  }, [allProjectsData, projectManagement, saveToLocalStorage])

  // Effect to load lines when current project changes
  useEffect(() => {
    if (projectManagement.currentProjectName) {
      getLinesFromDB(projectManagement.currentProjectName)
        .then(lines => {
          setCurrentProjectLines(lines)
        })
        .catch(error => {
          console.error("Failed to load lines for project:", projectManagement.currentProjectName, error)
          setCurrentProjectLines([]) // Reset lines on error
        })
    } else {
      setCurrentProjectLines([]) // No project selected, clear lines
    }
  }, [projectManagement.currentProjectName])


  // --- Project Management Functions ---
  const createNewProject = useCallback((projectName: string) => {
    if (projectManagement.projectNames.includes(projectName) || !projectName.trim()) {
      console.warn("Project already exists or name is invalid:", projectName)
      return
    }
    setAllProjectsDataState(prevData => ({
      ...prevData,
      [projectName]: { [DEFAULT_CATEGORY]: [] },
    }))
    setProjectManagementState(prevMgmt => ({
      projectNames: [...prevMgmt.projectNames, projectName],
      currentProjectName: projectName,
    }))
    // setCurrentProjectLines([]); // New project will have no lines initially, covered by above useEffect
  }, [projectManagement.projectNames])

  const setCurrentProjectName = useCallback((projectName: string) => {
    if (projectManagement.projectNames.includes(projectName)) {
      setProjectManagementState(prevMgmt => ({
        ...prevMgmt,
        currentProjectName: projectName,
      }))
    } else {
      console.warn("Attempted to switch to non-existent project:", projectName)
    }
  }, [projectManagement.projectNames])


  // --- Feature Management Functions (operating on the current project) ---

  // This function replaces the old setSavedFeatures. It's for loading data into the CURRENT project.
  const loadDataIntoCurrentProject = useCallback((dataToLoad: SavedFeaturesStateType | ((prevData: SavedFeaturesStateType) => SavedFeaturesStateType)) => {
    setAllProjectsDataState(prevAllData => {
      const currentProject = projectManagement.currentProjectName
      const currentProjectData = prevAllData[currentProject] || { [DEFAULT_CATEGORY]: [] }
      
      const newDataForCurrentProject = typeof dataToLoad === "function"
        ? dataToLoad(currentProjectData)
        : dataToLoad

      return {
        ...prevAllData,
        [currentProject]: newDataForCurrentProject,
      }
    })
  }, [projectManagement.currentProjectName])


  const addFeature = useCallback((listName: string, feature: GeoJsonFeature) => {
    if (!feature) return
    setAllProjectsDataState(prevAllData => {
      const currentProject = projectManagement.currentProjectName
      const projectData = prevAllData[currentProject] || { [DEFAULT_CATEGORY]: [] }
      const newList = [...(projectData[listName] || []), feature]

      let updatedProjectData: SavedFeaturesStateType
      if (listName === DEFAULT_CATEGORY) {
        updatedProjectData = {
          ...projectData,
          [listName]: newList,
        }
      } else {
        updatedProjectData = {
          ...projectData,
          [listName]: newList,
          [DEFAULT_CATEGORY]: (projectData[DEFAULT_CATEGORY] || []).filter((f) => f.properties?.id !== feature.properties?.id),
        }
      }
      return { ...prevAllData, [currentProject]: updatedProjectData }
    })
  }, [projectManagement.currentProjectName])

  const removeFeature = useCallback((listName: string, selection: selectionInfo | null) => {
    if (!selection) {
      console.error("No selection info when trying to remove feature")
      return
    }
    setAllProjectsDataState(prevAllData => {
      const currentProject = projectManagement.currentProjectName
      const projectData = prevAllData[currentProject] || { [DEFAULT_CATEGORY]: [] }
      const newList = (projectData[listName] || []).filter((f, index) => idxFeat(index, f) !== idxSel(selection))
      
      return {
        ...prevAllData,
        [currentProject]: {
          ...projectData,
          [listName]: newList,
        },
      }
    })
  }, [projectManagement.currentProjectName])

  const updateFeature = useCallback((oldFeature: GeoJsonFeature, newFeature: GeoJsonFeature) => {
    setAllProjectsDataState(prevAllData => {
      const currentProject = projectManagement.currentProjectName
      const projectData = prevAllData[currentProject] || { [DEFAULT_CATEGORY]: [] }
      const newProjectData = { ...projectData }
      for (const key in newProjectData) {
        newProjectData[key] = newProjectData[key].map((item) =>
          item.properties?.id === oldFeature.properties?.id ? newFeature : item,
        )
      }
      return { ...prevAllData, [currentProject]: newProjectData }
    })
  }, [projectManagement.currentProjectName])

  // --- Context Value ---
  // The 'savedFeatures' provided to context consumers is now only for the current project
  const currentProjectSavedFeatures = allProjectsData[projectManagement.currentProjectName] || { [DEFAULT_CATEGORY]: [] }

  const contextValue: SavedFeaturesContextType = {
    savedFeatures: currentProjectSavedFeatures, // Consumers see only the current project's features
    addFeature,
    removeFeature,
    updateFeature,
    setSavedFeatures: loadDataIntoCurrentProject, // Renamed for clarity in this new model
    saveToLocalStorage,
    loadFromLocalStorage,
    currentProjectName: projectManagement.currentProjectName,
    projectNames: projectManagement.projectNames,
    setCurrentProjectName,
    createNewProject,
    // Line / Route management functions
    currentProjectLines,
    addNewLine,
    updateExistingLine,
    deleteExistingLine,
  }

  return (
    <SavedFeaturesContext.Provider value={contextValue}>
      {children}
    </SavedFeaturesContext.Provider>
  )
}

export default SavedFeaturesProvider
