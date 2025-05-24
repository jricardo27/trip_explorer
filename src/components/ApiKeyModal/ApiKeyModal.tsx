import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Snackbar,
} from "@mui/material"
import CryptoJS from "crypto-js"
import React, { useState } from "react"

interface ApiKeyModalProps {
  open: boolean
  onClose: () => void
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ open, onClose }) => {
  const [apiKey, setApiKey] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleSave = () => {
    if (!apiKey.trim() || !password.trim()) {
      setError("API Key and Password cannot be empty.")
      return
    }
    setError(null)

    try {
      const encryptedApiKeyString = CryptoJS.AES.encrypt(apiKey, password).toString()
      // Store only the encrypted key
      localStorage.setItem("googleEncryptedApiKey", encryptedApiKeyString)

      // Remove old insecurely stored items if they exist
      localStorage.removeItem("googleApiKeyPassword") // Remove insecure password
      localStorage.removeItem("googleApiKey") // Remove old key if name changed

      console.log("API Key encrypted and stored (key only). Password is not stored.")
      onClose() // Close the modal
      setApiKey("") // Clear fields
      setPassword("")
    } catch (e) {
      console.error("Encryption failed:", e)
      setError("Failed to encrypt and store API Key. See console for details.")
    }
  }

  const handleCancel = () => {
    onClose()
    setError(null) // Clear any previous errors
    setApiKey("") // Clear fields
    setPassword("")
  }

  return (
    <>
      <Dialog open={open} onClose={handleCancel}>
        <DialogTitle>Set Google Geocoding API Key</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Enter your Google Geocoding API Key and a password.
            The API key will be stored encrypted in your browser's local storage.
            You will need to enter this password again each session to unlock the geocoding feature.
            The password itself is NOT stored.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="apiKey"
            label="Google Geocoding API Key"
            type="text"
            fullWidth
            variant="outlined"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            id="password"
            label="Password for Encryption"
            type="password"
            fullWidth
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSave} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
      {error && (
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError(null)}
          message={error}
        />
      )}
    </>
  )
}

export default ApiKeyModal
