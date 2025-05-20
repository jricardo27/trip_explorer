// --- Mocking Area ---
const DEFAULT_CATEGORY = "all";
let mockSavedFeatures = {};
let mockContextMenuTab = null;
let mockSelectedTab = null;
let mockAlerts = [];
let mockConsoleErrors = [];

// Mock alert and console.error
global.alert = (message) => {
  console.log(`ALERT: ${message}`);
  mockAlerts.push(message);
};
global.console.error = (message) => {
  console.log(`CONSOLE.ERROR: ${message}`);
  mockConsoleErrors.push(message);
};

// Simplified version of the core logic of useCategoryManagement's handleRenameCategory
// Based on the last known good state of the function.
const setSavedFeaturesMock = (updater) => {
  if (typeof updater === 'function') {
    mockSavedFeatures = updater(mockSavedFeatures);
  } else {
    mockSavedFeatures = updater;
  }
};

const setSelectedTabMock = (tabName) => {
  mockSelectedTab = tabName;
};

const handleRenameCategory = (newName) => {
  // Initial Guard & Default Category Checks
  if (!mockContextMenuTab) {
    console.error("Rename category called without contextMenuTab");
    return;
  }
  if (mockContextMenuTab === DEFAULT_CATEGORY) {
    alert(`Cannot rename the default category "${DEFAULT_CATEGORY}".`);
    return;
  }
  if (newName === DEFAULT_CATEGORY) {
    alert(`Cannot rename category to "${DEFAULT_CATEGORY}". Please choose a different name.`);
    return;
  }

  // No-op Rename Check
  if (newName === mockContextMenuTab) {
    return; // It's the same name, do nothing
  }

  // Existing Name Check (Data Loss Prevention)
  // This check uses the `savedFeatures` state directly.
  if (Object.keys(mockSavedFeatures).includes(newName)) {
    alert(`Category "${newName}" already exists. Please choose a different name.`);
    return; // Prevent renaming
  }

  // If all checks pass, then we attempt to save and select.
  setSavedFeaturesMock((prev) => {
    const orderedKeys = Object.keys(prev);
    const newSavedFeatures = {};
    for (const key of orderedKeys) {
      if (key === mockContextMenuTab) {
        newSavedFeatures[newName] = prev[mockContextMenuTab];
      } else {
        newSavedFeatures[key] = prev[key];
      }
    }
    return newSavedFeatures;
  });

  setSelectedTabMock(newName);
};

// --- Test Runner ---
const resetMocks = () => {
  mockAlerts = [];
  mockConsoleErrors = [];
  mockSavedFeatures = {};
  mockContextMenuTab = null;
  mockSelectedTab = null;
};

const printState = (testName) => {
  console.log(`--- ${testName} ---`);
  console.log("Alerts:", mockAlerts);
  console.log("Console Errors:", mockConsoleErrors);
  console.log("Saved Features:", JSON.stringify(mockSavedFeatures, null, 2));
  console.log("Selected Tab:", mockSelectedTab);
  console.log("---------------------\n");
};

const verify = (condition, passMessage, failMessage) => {
  if (condition) {
    console.log(`PASS: ${passMessage}`);
    return true;
  } else {
    console.error(`FAIL: ${failMessage}`);
    return false;
  }
};

// --- Test Scenarios ---

// 1. Data Loss Prevention
resetMocks();
console.log("Starting Test 1: Data Loss Prevention");
mockSavedFeatures = { "all": [], "Category A": ["feat1"], "Category B": ["feat2"] };
mockContextMenuTab = "Category A";
const originalSelectedTab1 = "Category A"; // Assume this was the selected tab
mockSelectedTab = originalSelectedTab1;
const originalSavedFeatures1 = JSON.parse(JSON.stringify(mockSavedFeatures)); // Deep copy

handleRenameCategory("Category B");

let test1_passed = true;
test1_passed = test1_passed && verify(mockAlerts.length === 1 && mockAlerts[0].includes('Category "Category B" already exists'), "Alert for existing category name triggered.", "Alert for existing category name NOT triggered or incorrect message.");
test1_passed = test1_passed && verify(JSON.stringify(mockSavedFeatures) === JSON.stringify(originalSavedFeatures1), "savedFeatures remains unchanged.", "savedFeatures was changed!");
test1_passed = test1_passed && verify(mockSelectedTab === originalSelectedTab1, "selectedTab remains unchanged.", `selectedTab changed to ${mockSelectedTab}!`);
printState("Test 1 Results");
if(test1_passed) console.log("Test 1: Data Loss Prevention PASSED\n"); else console.error("Test 1: Data Loss Prevention FAILED\n");


// 2. No-Op Rename
resetMocks();
console.log("Starting Test 2: No-Op Rename");
mockSavedFeatures = { "all": [], "Category C": ["feat3"] };
mockContextMenuTab = "Category C";
const originalSelectedTab2 = "Category C";
mockSelectedTab = originalSelectedTab2;
const originalSavedFeatures2 = JSON.parse(JSON.stringify(mockSavedFeatures));

handleRenameCategory("Category C");

let test2_passed = true;
test2_passed = test2_passed && verify(mockAlerts.length === 0, "No alert triggered.", `Alerts triggered: ${mockAlerts.join(", ")}`);
test2_passed = test2_passed && verify(JSON.stringify(mockSavedFeatures) === JSON.stringify(originalSavedFeatures2), "savedFeatures remains unchanged.", "savedFeatures was changed!");
test2_passed = test2_passed && verify(mockSelectedTab === originalSelectedTab2, "selectedTab remains unchanged.", `selectedTab changed to ${mockSelectedTab}!`);
printState("Test 2 Results");
if(test2_passed) console.log("Test 2: No-Op Rename PASSED\n"); else console.error("Test 2: No-Op Rename FAILED\n");


// 3. General Rename (Order Preservation & setSelectedTab)
resetMocks();
console.log("Starting Test 3: General Rename");
mockSavedFeatures = { "all": [], "Cat X": [], "Cat Y": ["featY"], "Cat Z": [] };
mockContextMenuTab = "Cat Y";
mockSelectedTab = "Cat Y"; // Current tab is Cat Y
const expectedSavedFeatures3 = { "all": [], "Cat X": [], "Cat Y New": ["featY"], "Cat Z": [] };
const expectedKeyOrder3 = ["all", "Cat X", "Cat Y New", "Cat Z"];

handleRenameCategory("Cat Y New");

let test3_passed = true;
test3_passed = test3_passed && verify(mockAlerts.length === 0, "No alert triggered.", `Alerts triggered: ${mockAlerts.join(", ")}`);
test3_passed = test3_passed && verify(JSON.stringify(mockSavedFeatures) === JSON.stringify(expectedSavedFeatures3), "savedFeatures updated correctly.", `savedFeatures is ${JSON.stringify(mockSavedFeatures)}`);
const actualKeyOrder3 = Object.keys(mockSavedFeatures);
test3_passed = test3_passed && verify(JSON.stringify(actualKeyOrder3) === JSON.stringify(expectedKeyOrder3), `Key order is correct: ${actualKeyOrder3.join(", ")}`, `Key order is incorrect: ${actualKeyOrder3.join(", ")}`);
test3_passed = test3_passed && verify(mockSelectedTab === "Cat Y New", "selectedTab updated to 'Cat Y New'.", `selectedTab is ${mockSelectedTab}`);
printState("Test 3 Results");
if(test3_passed) console.log("Test 3: General Rename PASSED\n"); else console.error("Test 3: General Rename FAILED\n");


// 4. Renaming involving DEFAULT_CATEGORY ("all")
// 4a. Attempt to rename "all"
resetMocks();
console.log("Starting Test 4a: Attempt to rename 'all'");
mockSavedFeatures = { "all": [], "OtherCat": [] };
mockContextMenuTab = "all";
const originalSelectedTab4a = "all";
mockSelectedTab = originalSelectedTab4a;
const originalSavedFeatures4a = JSON.parse(JSON.stringify(mockSavedFeatures));

handleRenameCategory("New All Name");

let test4a_passed = true;
test4a_passed = test4a_passed && verify(mockAlerts.length === 1 && mockAlerts[0].includes('Cannot rename the default category "all"'), "Alert for trying to rename 'all' triggered.", "Alert for renaming 'all' NOT triggered or incorrect message.");
test4a_passed = test4a_passed && verify(JSON.stringify(mockSavedFeatures) === JSON.stringify(originalSavedFeatures4a), "savedFeatures remains unchanged.", "savedFeatures was changed!");
test4a_passed = test4a_passed && verify(mockSelectedTab === originalSelectedTab4a, "selectedTab remains unchanged.", `selectedTab changed to ${mockSelectedTab}!`);
printState("Test 4a Results");
if(test4a_passed) console.log("Test 4a: Attempt to rename 'all' PASSED\n"); else console.error("Test 4a: Attempt to rename 'all' FAILED\n");


// 4b. Attempt to rename a category *to* "all"
resetMocks();
console.log("Starting Test 4b: Attempt to rename a category TO 'all'");
mockSavedFeatures = { "all": [], "OtherCat": [] };
mockContextMenuTab = "OtherCat";
const originalSelectedTab4b = "OtherCat";
mockSelectedTab = originalSelectedTab4b;
const originalSavedFeatures4b = JSON.parse(JSON.stringify(mockSavedFeatures));

handleRenameCategory("all");

let test4b_passed = true;
test4b_passed = test4b_passed && verify(mockAlerts.length === 1 && mockAlerts[0].includes('Cannot rename category to "all"'), "Alert for trying to rename TO 'all' triggered.", "Alert for renaming TO 'all' NOT triggered or incorrect message.");
test4b_passed = test4b_passed && verify(JSON.stringify(mockSavedFeatures) === JSON.stringify(originalSavedFeatures4b), "savedFeatures remains unchanged.", "savedFeatures was changed!");
test4b_passed = test4b_passed && verify(mockSelectedTab === originalSelectedTab4b, "selectedTab remains unchanged.", `selectedTab changed to ${mockSelectedTab}!`);
printState("Test 4b Results");
if(test4b_passed) console.log("Test 4b: Attempt to rename a category TO 'all' PASSED\n"); else console.error("Test 4b: Attempt to rename a category TO 'all' FAILED\n");

console.log("All tests finished.");
