// Simplified self-contained test for category renaming logic

const DEFAULT_CATEGORY = "all"; // Mimicking the constant

// --- State and Mock Functions ---
let savedFeatures = {
  [DEFAULT_CATEGORY]: [], // Initialize with the default category
};
let selectedTab = DEFAULT_CATEGORY; // Mock selected tab state
let contextMenuTab = null; // Mock context menu tab (the category being operated on)

// Mock for setSavedFeatures (updates our local `savedFeatures` and logs)
const setSavedFeatures = (updater) => {
  if (typeof updater === 'function') {
    savedFeatures = updater(savedFeatures);
  } else {
    savedFeatures = updater;
  }
  console.log('SavedFeatures updated:', JSON.stringify(savedFeatures, null, 2));
};

// Mock for setSelectedTab (updates our local `selectedTab` and logs)
const setSelectedTab = (tab) => {
  selectedTab = tab;
  console.log('SelectedTab updated:', selectedTab);
};

// --- Simplified Category Management Logic (incorporating the fix) ---

// Simplified version of handleAddCategory
const handleAddCategory = (newCategoryName) => {
  if (!newCategoryName || Object.keys(savedFeatures).includes(newCategoryName)) {
    console.error(`Category "${newCategoryName}" already exists or is invalid.`);
    return;
  }
  setSavedFeatures(prev => ({
    ...prev,
    [newCategoryName]: [],
  }));
  console.log(`Category "${newCategoryName}" added.`);
};

// Simplified version of handleRenameCategory (this is the logic we are testing)
const handleRenameCategory = (newName) => {
  // contextMenuTab should be set to the oldName before calling this
  const oldName = contextMenuTab;

  if (oldName && oldName !== DEFAULT_CATEGORY && newName && newName !== DEFAULT_CATEGORY && oldName !== newName) {
    setSavedFeatures(prev => {
      const orderedKeys = Object.keys(prev);
      const newSavedFeatures = {}; // Use SavedFeaturesStateType equivalent
      for (const key of orderedKeys) {
        if (key === oldName) {
          newSavedFeatures[newName] = prev[oldName];
        } else if (key !== oldName) { // Ensure we don't copy the old key if it's different
          newSavedFeatures[key] = prev[key];
        }
      }
      // If oldName was not in orderedKeys (should not happen if logic is correct)
      // or if newName somehow overwrote a different key (should also not happen)
      // this logic preserves the order of iteration from original keys.
      return newSavedFeatures;
    });
    setSelectedTab(newName); // Update the selected tab to the new name
    console.log(`Category "${oldName}" renamed to "${newName}".`);
  } else {
    console.error("Invalid rename operation:", { oldName, newName, DEFAULT_CATEGORY });
  }
};

// Helper to add a dummy feature (not strictly necessary for order testing, but good for mimicking state)
const addDummyFeature = (categoryName, featureId) => {
  if (savedFeatures[categoryName]) {
    savedFeatures[categoryName].push({ id: featureId, properties: {} });
    // No need to call setSavedFeatures here if we're directly mutating for test setup simplicity,
    // but for consistency with actual implementation, one might prefer it.
    // For this test, direct mutation is fine for setup before rename.
    console.log(`Dummy feature "${featureId}" added to category "${categoryName}".`);
  } else {
    console.error(`Category "${categoryName}" does not exist for adding feature.`);
  }
};


// --- Test Execution ---

console.log('Initial state:', JSON.stringify(savedFeatures, null, 2));

// 1. Application running (simulated)

// 2. Create categories
handleAddCategory("Category A");
handleAddCategory("Category B");
handleAddCategory("Category C");

console.log('\nState after adding categories:', JSON.stringify(savedFeatures, null, 2));

// 3. Add dummy features
addDummyFeature("Category A", "featA1");
addDummyFeature("Category B", "featB1");
addDummyFeature("Category C", "featC1");

console.log('\nState after adding features:', JSON.stringify(savedFeatures, null, 2));

// 4. Reorder categories manually for testing: B, A, C
//    (The actual reorder mechanism is not part of this test's scope, only its effect on renaming)
const manuallyReorderedFeatures = {
  [DEFAULT_CATEGORY]: savedFeatures[DEFAULT_CATEGORY],
  "Category B": savedFeatures["Category B"],
  "Category A": savedFeatures["Category A"],
  "Category C": savedFeatures["Category C"],
};
setSavedFeatures(manuallyReorderedFeatures);
console.log('\nState after manual reorder (B, A, C):', JSON.stringify(savedFeatures, null, 2));

// 5. Rename a category in the middle ("Category A" to "Category A Renamed")
contextMenuTab = "Category A"; // Set the category to be renamed
handleRenameCategory("Category A Renamed");

// 6. Verification for step 5
console.log('\n--- Verification 1: Rename middle category ---');
let currentKeys = Object.keys(savedFeatures).filter(k => k !== DEFAULT_CATEGORY);
console.log('Expected order: Category B, Category A Renamed, Category C');
console.log('Actual order:', currentKeys.join(', '));
if (currentKeys.length === 3 && currentKeys[0] === "Category B" && currentKeys[1] === "Category A Renamed" && currentKeys[2] === "Category C") {
  console.log('Verification 1 PASSED');
} else {
  console.log('Verification 1 FAILED');
}

// 7. Rename the first category ("Category B" to "Category B Renamed")
contextMenuTab = "Category B"; // Set the category to be renamed
handleRenameCategory("Category B Renamed");

// 8. Verification for step 7
console.log('\n--- Verification 2: Rename first category ---');
currentKeys = Object.keys(savedFeatures).filter(k => k !== DEFAULT_CATEGORY);
console.log('Expected order: Category B Renamed, Category A Renamed, Category C');
console.log('Actual order:', currentKeys.join(', '));
if (currentKeys.length === 3 && currentKeys[0] === "Category B Renamed" && currentKeys[1] === "Category A Renamed" && currentKeys[2] === "Category C") {
  console.log('Verification 2 PASSED');
} else {
  console.log('Verification 2 FAILED');
}

// 9. Rename the last category ("Category C" to "Category C Renamed")
contextMenuTab = "Category C"; // Set the category to be renamed
handleRenameCategory("Category C Renamed");

// 10. Verification for step 9
console.log('\n--- Verification 3: Rename last category ---');
currentKeys = Object.keys(savedFeatures).filter(k => k !== DEFAULT_CATEGORY);
console.log('Expected order: Category B Renamed, Category A Renamed, Category C Renamed');
console.log('Actual order:', currentKeys.join(', '));
if (currentKeys.length === 3 && currentKeys[0] === "Category B Renamed" && currentKeys[1] === "Category A Renamed" && currentKeys[2] === "Category C Renamed") {
  console.log('Verification 3 PASSED');
} else {
  console.log('Verification 3 FAILED');
}

console.log("\nSimplified manual testing script finished.");
