// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom/vitest"

// Optional: If you want a global localStorage mock for all tests,
// you can uncomment and use the following. Otherwise, mock it per-suite/per-test.
/*
const store = {};
vi.stubGlobal('localStorage', {
  getItem: (key: string) => store[key] || null,
  setItem: (key: string, value: string) => { store[key] = value; },
  removeItem: (key: string) => { delete store[key]; },
  clear: () => {
    for (const key in store) {
      if (Object.prototype.hasOwnProperty.call(store, key)) {
        delete store[key];
      }
    }
  },
  length: Object.keys(store).length, // Add length property
  key: (index: number) => Object.keys(store)[index] || null, // Add key method
});
*/

// Any other global setup can go here
global.IS_REACT_ACT_ENVIRONMENT = true // Suggested for React 18+ with Testing Library
console.log("Global test setup file loaded.")
