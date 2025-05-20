import React from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import Tutorial from "./Tutorial.tsx" // Path to your Tutorial component

// Mock react-joyride
// We are interested in whether the Joyride component gets the correct `run` prop
vi.mock("react-joyride", () => ({
  // Default export for the Joyride component
  default: vi.fn((props) => (
    <div data-testid="mock-joyride" data-run={props.run ? "true" : "false"}>
      {/* Optionally render steps if needed for more complex assertions */}
      {/* {props.steps.map((step: any, index: number) => <div key={index}>{step.content}</div>)} */}
    </div>
  )),
  // Named exports if your component uses them (e.g., STATUS, EVENTS)
  STATUS: { FINISHED: "finished", SKIPPED: "skipped" },
  EVENTS: { STEP_AFTER: "step:after", TARGET_NOT_FOUND: "error:target_not_found" },
  ACTIONS: { START: "start", STOP: "stop" },
}))


describe("Tutorial Component with React Joyride", () => {
  beforeEach(() => {
    // Reset any previous mock calls or implementations if necessary
    vi.clearAllMocks()
  })

  it("renders the 'Start Interactive Tour' button", () => {
    render(<Tutorial />)
    expect(screen.getByRole("button", { name: /Start Interactive Tour of POI Selection/i })).toBeInTheDocument()
  })

  it("initially renders the mocked Joyride component with run={false}", () => {
    render(<Tutorial />)
    const mockJoyride = screen.getByTestId("mock-joyride")
    expect(mockJoyride).toBeInTheDocument()
    expect(mockJoyride.getAttribute("data-run")).toBe("false")
  })

  it("sets run={true} for Joyride component when 'Start Interactive Tour' button is clicked", async () => {
    render(<Tutorial />)
    
    const startButton = screen.getByRole("button", { name: /Start Interactive Tour of POI Selection/i })
    fireEvent.click(startButton)

    // Wait for state update and Joyride prop change
    // The setTimeout in startTour function in Tutorial.tsx makes waiting necessary
    await waitFor(() => {
      const mockJoyride = screen.getByTestId("mock-joyride")
      expect(mockJoyride.getAttribute("data-run")).toBe("true")
    })
  })

  // Optional: Test if Joyride component receives correct steps
  // This requires the mock to render steps or capture props more deeply.
  // For this example, the current mock is simple.
  // If you need to check steps, the mock for react-joyride would need to be more sophisticated
  // or you'd spy on the Joyride component's props.
})

// Helper to check if an element is in the document, useful for Vitest with @testing-library/jest-dom
// Ensure your Vitest setup includes jest-dom matchers, e.g., via a setup file:
// import '@testing-library/jest-dom/vitest';
// For this environment, I assume toBeInTheDocument is available.
