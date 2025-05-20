import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Snackbar,
} from '@mui/material';
import CryptoJS from 'crypto-js';

interface ApiKeyModalProps {
  open: boolean;
  onClose: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ open, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    if (!apiKey.trim() || !password.trim()) {
      setError('API Key and Password cannot be empty.');
      return;
    }
    setError(null);

    try {
      const encryptedApiKey = CryptoJS.AES.encrypt(apiKey, password).toString();
      localStorage.setItem('googleApiKey', encryptedApiKey);
      localStorage.setItem('googleApiKeyPassword', password); // Storing password for decryption
      console.log('API Key encrypted and stored.');
      onClose(); // Close the modal
      setApiKey(''); // Clear fields
      setPassword('');
    } catch (e) {
      console.error('Encryption failed:', e);
      setError('Failed to encrypt and store API Key. See console for details.');
    }
  };

  const handleCancel = () => {
    onClose();
    setError(null); // Clear any previous errors
    setApiKey(''); // Clear fields
    setPassword('');
  };

  return (
    <>
      <Dialog open={open} onClose={handleCancel}>
        <DialogTitle>Google Geocoding API Key</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Enter your Google Geocoding API Key and a password to encrypt it.
            This key will be stored locally in your browser, encrypted with your password.
            The password will also be stored to enable automatic decryption.
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
  );
};

export default ApiKeyModal;
