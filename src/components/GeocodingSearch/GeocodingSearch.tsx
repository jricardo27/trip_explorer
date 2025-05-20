import React, { useState, useEffect } from 'react';
import { Button, TextField, Snackbar, Box, Typography, Paper, Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText } from '@mui/material';
import CryptoJS from 'crypto-js';
import axios from 'axios';
import { TCoordinate, TCurrentSearchResult } from '../../data/types';

interface GeocodingResult {
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  // Add other properties if needed
}

interface GeocodingSearchProps {
  setCurrentSearchResult: (result: TCurrentSearchResult) => void;
}

const GeocodingSearch: React.FC<GeocodingSearchProps> = ({ setCurrentSearchResult }) => {
  const [addressInput, setAddressInput] = useState('');
  const [searchResults, setSearchResults] = useState<GeocodingResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [sessionPassword, setSessionPassword] = useState('');
  const [decryptedApiKeyForSession, setDecryptedApiKeyForSession] = useState<string | null>(null);

  // Effect to clear decrypted key if password changes or is cleared (e.g. for re-validation)
  useEffect(() => {
    if (!sessionPassword) {
      setDecryptedApiKeyForSession(null);
    }
  }, [sessionPassword]);
  
  const attemptDecryptionAndSetKey = () => {
    const encryptedApiKeyString = localStorage.getItem('googleEncryptedApiKey');
    if (!encryptedApiKeyString) {
      setError('API Key not configured. Please set it via the Key icon in the top menu.');
      setShowPasswordPrompt(false); // Ensure prompt is hidden if no key to decrypt
      return false;
    }
    if (!sessionPassword) {
      setError('Password is required to decrypt the API key.');
      setShowPasswordPrompt(true); // Keep prompt if password was cleared/empty
      return false;
    }

    try {
      const decryptedBytes = CryptoJS.AES.decrypt(encryptedApiKeyString, sessionPassword);
      const decryptedKey = decryptedBytes.toString(CryptoJS.enc.Utf8);
      if (!decryptedKey) {
        setError('Invalid password or corrupted API key. Please re-enter password or re-set API Key.');
        setSessionPassword(''); // Clear session password on failure
        setDecryptedApiKeyForSession(null);
        setShowPasswordPrompt(true);
        return false;
      }
      setDecryptedApiKeyForSession(decryptedKey);
      setShowPasswordPrompt(false); // Hide prompt on successful decryption
      setError(null); // Clear previous errors
      return true;
    } catch (e) {
      console.error('Decryption process error:', e);
      setError('Decryption failed. Check password or re-set API Key.');
      setSessionPassword('');
      setDecryptedApiKeyForSession(null);
      setShowPasswordPrompt(true);
      return false;
    }
  };

  const handleSearch = async () => {
    setSearchResults(null);
    setError(null);
    setCurrentSearchResult(null);

    if (!addressInput.trim()) {
      setError('Address cannot be empty.');
      return;
    }

    const encryptedApiKeyString = localStorage.getItem('googleEncryptedApiKey');
    if (!encryptedApiKeyString) {
      setError('API Key not configured. Please set it via the Key icon in the top menu.');
      return;
    }

    let currentApiKey = decryptedApiKeyForSession;

    if (!currentApiKey) {
      if (!sessionPassword) {
        setShowPasswordPrompt(true);
        // Optionally, set a specific error message like "Password needed for this session."
        setError('Please enter your password to unlock the Geocoding feature for this session.');
        return;
      }
      // If sessionPassword is set, but decryptedApiKeyForSession is not, try to decrypt again.
      // This handles the case where user enters password then immediately searches.
      if (!attemptDecryptionAndSetKey()) {
         // attemptDecryptionAndSetKey will set appropriate errors and showPasswordPrompt
        return;
      }
      // After successful decryption, decryptedApiKeyForSession will be set.
      // We need to use it in this current execution of handleSearch.
      // Re-reading from state here won't work immediately due to async nature of setState.
      // So, let's retrieve it directly after attemptDecryptionAndSetKey potentially sets it.
      // This is a bit of a workaround for the immediate need of the key.
      // A better approach might be to make attemptDecryptionAndSetKey return the key or make handleSearch more state-driven.
      // For now, let's assume attemptDecryptionAndSetKey updates a variable that can be read here.
      // The state `decryptedApiKeyForSession` will be set for subsequent calls.
      // A more direct way:
      try {
        const decryptedBytes = CryptoJS.AES.decrypt(encryptedApiKeyString, sessionPassword);
        currentApiKey = decryptedBytes.toString(CryptoJS.enc.Utf8);
        if (!currentApiKey) {
            setError('Invalid password. Please try again.');
            setSessionPassword(''); // Clear session password
            setShowPasswordPrompt(true);
            return;
        }
        setDecryptedApiKeyForSession(currentApiKey); // Save for next time
      } catch (e) {
        setError('Decryption failed. Please check your password or re-set API Key.');
        setSessionPassword('');
        setShowPasswordPrompt(true);
        return;
      }
    }
    
    if (!currentApiKey) { // Final check if API key is available
        setError('API Key is not available for search. Please unlock with password.');
        setShowPasswordPrompt(true);
        return;
    }


    const encodedAddress = encodeURIComponent(addressInput);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${currentApiKey}`;

    try {
      const response = await axios.get(url);
      const { data } = response;

      if (data.results && data.results.length > 0 && data.status === 'OK') {
        const firstResult = data.results[0];
        const address = firstResult.formatted_address;
        if (firstResult.geometry && firstResult.geometry.location && address) {
          setCurrentSearchResult({
            coordinate: { 
              lat: firstResult.geometry.location.lat, 
              lng: firstResult.geometry.location.lng 
            },
            address: address,
          });
        } else {
          setCurrentSearchResult(null);
        }
        setSearchResults(data.results);
        console.log('Geocoding results:', data.results);
        setShowPasswordPrompt(false); // Hide prompt on successful search
      } else {
        setCurrentSearchResult(null);
        setSearchResults([]);
        if (data.status === 'ZERO_RESULTS') {
          setError('No results found for the specified address.');
        } else if (data.status === 'OVER_QUERY_LIMIT') {
          setError('API query limit reached. Please check your Google Cloud Console.');
        } else if (data.status === 'REQUEST_DENIED') {
          // This could also be due to an invalid key after wrong password decryption
          setError('Geocoding request denied. Check API key or password if prompted.');
           if (decryptedApiKeyForSession && !data.error_message?.toLowerCase().includes('api key')) {
             // If we thought we had a decrypted key, but request is denied for other reasons than key itself,
             // it might be a bad decryption.
             setSessionPassword('');
             setDecryptedApiKeyForSession(null);
             setShowPasswordPrompt(true);
           }
        } else if (data.status === 'INVALID_REQUEST') {
          setError('Invalid request. Usually, this means the address or some parameter is missing.');
        } else if (data.status === 'UNKNOWN_ERROR') {
          setError('An unknown error occurred with the Geocoding service.');
        } else if (data.status === 'OK' && (!data.results || data.results.length === 0)) {
            setError('No results found for the address.');
        } else {
          setError(`Geocoding failed: ${data.status} - ${data.error_message || 'Unknown error'}`);
        }
      }
    } catch (err) {
      setCurrentSearchResult(null);
      console.error('Geocoding API request error:', err);

      if (decryptedApiKeyForSession) {
        // If we thought we had a valid (decrypted) API key, but the request failed,
        // it's possible the key was bad (e.g., decryption with wrong password yielded a non-empty but invalid string).
        // Or it could be a genuine network error with a previously good key.
        // Prioritize telling the user the key/password might be the issue and re-prompt.
        setError('Error during geocoding. The decrypted API key might be invalid or network issue. Please check password or re-set API Key, and check network.');
        setSessionPassword('');
        setDecryptedApiKeyForSession(null);
        setShowPasswordPrompt(true);
      } else if (axios.isAxiosError(err)) {
        if (err.response) {
          setError(`Error from server: ${err.response.status} - ${err.response.data?.error_message || err.message}`);
        } else if (err.request) {
          setError('Network error: Could not reach Geocoding service.');
        } else {
          setError(`Request setup error: ${err.message}`);
        }
      } else {
        // Generic error if it's not an Axios error and we didn't have a decrypted key in play
        setError('An unexpected error occurred during geocoding.');
      }
    }
  };

  return (
    <Box sx={{ p: 2, maxWidth: 500, margin: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        Address Search
      </Typography>
      <TextField
        fullWidth
        label="Enter address"
        variant="outlined"
        value={addressInput}
        onChange={(e) => setAddressInput(e.target.value)}
        sx={{ mb: 1 }} // Reduced margin
      />
      
      {showPasswordPrompt && (
        <Box sx={{ my: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
           <Typography variant="caption" color="textSecondary">
            Enter password to unlock API Key for this session:
          </Typography>
          <TextField
            type="password"
            label="Session Password"
            variant="outlined"
            size="small"
            value={sessionPassword}
            onChange={(e) => setSessionPassword(e.target.value)}
            onKeyPress={(e) => { if (e.key === 'Enter') { 
              if(attemptDecryptionAndSetKey()) {
                handleSearch(); // Re-trigger search after successful unlock via Enter
              }
            }}}
          />
           <Button variant="outlined" size="small" onClick={() => {
             if(attemptDecryptionAndSetKey()) {
                // Optionally, auto-search after unlock or just let user click search again
                // For now, let's clear the specific password prompt error and let them click search
                setError(null); 
             }
            }}>
            Unlock API Key
          </Button>
        </Box>
      )}

      <Button variant="contained" onClick={handleSearch} sx={{ mb: 2, mt: showPasswordPrompt ? 1 : 0 }}>
        Search Address
      </Button>

      {searchResults && searchResults.length > 0 && (
        <Paper elevation={3} sx={{ p: 2, mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Results:
          </Typography>
          {searchResults.map((result, index) => (
            <Box key={index} sx={{ mb: 1 }}>
              <Typography variant="body2">
                {result.formatted_address} (Lat: {result.geometry.location.lat}, Lng: {result.geometry.location.lng})
              </Typography>
            </Box>
          ))}
        </Paper>
      )}
      {searchResults && searchResults.length === 0 && !error && (
         <Typography variant="body1" color="textSecondary" sx={{ mt: 2 }}>
            No results found.
         </Typography>
      )}

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        message={error}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
};

export default GeocodingSearch;
