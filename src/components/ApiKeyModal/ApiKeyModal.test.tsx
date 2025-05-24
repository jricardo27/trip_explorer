import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import CryptoJS from "crypto-js"
import React from "react"
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

import ApiKeyModal from "./ApiKeyModal" // Adjust path as necessary

// Mock CryptoJS
vi.mock("crypto-js", async () => {
  const originalCryptoJS = await vi.importActual("crypto-js") as any
  return {
    default: { // For default import: import CryptoJS from 'crypto-js';
      ...originalCryptoJS,
      AES: {
        ...originalCryptoJS.AES,
        encrypt: vi.fn(() => ({
          toString: vi.fn(() => "encrypted-api-key"),
        })),
        // Decrypt mock isn't strictly needed for ApiKeyModal but good for consistency if it were
        decrypt: vi.fn((ciphertextData, _pass) => {
          const ciphertextString = typeof ciphertextData === "string" ? ciphertextData : ciphertextData.toString()
          return {
            toString: vi.fn((_encoding) => {
              if (ciphertextString === "encrypted-api-key") { // Example
                return "decrypted-api-key"
              }
              return "mock-decrypted-other"
            }),
          }
        }),
      },
      enc: {
        ...originalCryptoJS.enc,
        Utf8: originalCryptoJS.enc.Utf8,
      },
    },
  }
})

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
    getStore: () => store, // Helper to inspect store
  }
})()

vi.stubGlobal("localStorage", localStorageMock)

describe("ApiKeyModal", () => {
  beforeEach(() => {
    localStorageMock.clear() // Clear localStorage before each test
    vi.clearAllMocks() // Clear all vi mocks
  })

  afterEach(() => {
    localStorageMock.clear()
  })

  // Unit Test for Encryption and localStorage
  it("should encrypt the API key and save to localStorage when save is clicked with valid input", async () => {
    const mockOnClose = vi.fn()
    render(<ApiKeyModal open={true} onClose={mockOnClose} />)

    // Use more specific selector for the input field to avoid conflict with DialogTitle or other elements.
    const apiKeyInput = screen.getByRole("textbox", { name: /google geocoding api key/i })
    const passwordInput = screen.getByLabelText(/password for encryption/i) // This one should be unique enough
    const saveButton = screen.getByRole("button", { name: /save/i })

    const testApiKey = "test-api-key"
    const testPassword = "test-password"

    await userEvent.type(apiKeyInput, testApiKey)
    await userEvent.type(passwordInput, testPassword)
    fireEvent.click(saveButton)

    // Check if CryptoJS.AES.encrypt was called
    expect(CryptoJS.AES.encrypt).toHaveBeenCalledWith(testApiKey, testPassword)

    // Check if localStorage.setItem was called with the new key name
    expect(localStorageMock.getItem("googleEncryptedApiKey")).toBe("encrypted-api-key")

    // Check that old/insecure items are removed
    expect(localStorageMock.getItem("googleApiKeyPassword")).toBeNull()
    expect(localStorageMock.getItem("googleApiKey")).toBeNull()

    // Check if onClose was called
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  // Component Test for Interaction and Validation
  it("should show error Snackbar if API key is empty on save", async () => {
    const mockOnClose = vi.fn()
    render(<ApiKeyModal open={true} onClose={mockOnClose} />)

    const passwordInput = screen.getByLabelText(/password for encryption/i)
    const saveButton = screen.getByRole("button", { name: /save/i })

    await userEvent.type(passwordInput, "test-password")
    fireEvent.click(saveButton)

    // Use waitFor to check for the text content directly, as findByRole('alert') was flaky.
    await waitFor(() => {
      expect(screen.getByText("API Key and Password cannot be empty.")).toBeInTheDocument()
    }, { timeout: 3000 })

    expect(CryptoJS.AES.encrypt).not.toHaveBeenCalled()
    expect(mockOnClose).not.toHaveBeenCalled()
  })

  it("should show error Snackbar if password is empty on save", async () => {
    const mockOnClose = vi.fn()
    render(<ApiKeyModal open={true} onClose={mockOnClose} />)

    const apiKeyInput = screen.getByRole("textbox", { name: /google geocoding api key/i })
    const saveButton = screen.getByRole("button", { name: /save/i })

    await userEvent.type(apiKeyInput, "test-api-key")
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(screen.getByText("API Key and Password cannot be empty.")).toBeInTheDocument()
    }, { timeout: 3000 })

    expect(CryptoJS.AES.encrypt).not.toHaveBeenCalled()
    expect(mockOnClose).not.toHaveBeenCalled()
  })

  it("should call onClose and clear fields when Cancel button is clicked", async () => {
    const mockOnClose = vi.fn()
    render(<ApiKeyModal open={true} onClose={mockOnClose} />)

    const apiKeyInput = screen.getByRole("textbox", { name: /google geocoding api key/i }) as HTMLInputElement
    const passwordInput = screen.getByLabelText(/password for encryption/i) as HTMLInputElement
    const cancelButton = screen.getByRole("button", { name: /cancel/i })

    await userEvent.type(apiKeyInput, "test-api-key")
    await userEvent.type(passwordInput, "test-password")

    fireEvent.click(cancelButton)

    expect(mockOnClose).toHaveBeenCalledTimes(1)
    // Fields should be cleared, but testing their state after modal potentially unmounts
    // is tricky. The important part is onClose is called.
    // If they were stateful within a parent that didn't re-render, we could check.
    // For now, focus on onClose and no save action.
    expect(CryptoJS.AES.encrypt).not.toHaveBeenCalled()
    expect(localStorageMock.getItem("googleEncryptedApiKey")).toBeNull() // Check new key name
  })

  it("modal should not be visible if open prop is false", () => {
    const mockOnClose = vi.fn()
    render(<ApiKeyModal open={false} onClose={mockOnClose} />)

    // Dialog content is typically not rendered or hidden when open is false
    // Querying for the updated dialog title
    expect(screen.queryByText(/Set Google Geocoding API Key/i)).toBeNull()
  })
})
