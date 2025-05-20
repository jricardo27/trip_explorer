import React, { useState } from 'react';
import { Button, TextField, Snackbar, Box, Typography, Paper } from '@mui/material';
import React, { useState } from 'react';
import { Button, TextField, Snackbar, Box, Typography, Paper } from '@mui/material';
import CryptoJS from 'crypto-js';
import axios from 'axios';
import { TCoordinate } from '../../data/types';

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
  setCurrentSearchResult: (coordinate: TCoordinate | null) => void;
}

const GeocodingSearch: React.FC<GeocodingSearchProps> = ({ setCurrentSearchResult }) => {
  const [addressInput, setAddressInput] = useState('');
  const [searchResults, setSearchResults] = useState<GeocodingResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    setSearchResults(null);
    setError(null);
    setCurrentSearchResult(null); // Clear previous marker

    const encryptedApiKey = localStorage.getItem('googleApiKey');
    const password = localStorage.getItem('googleApiKeyPassword');

    if (!encryptedApiKey || !password) {
      setError('API Key not configured. Please set it via the Key icon in the top menu.');
      return;
    }

    let apiKey = '';
    try {
      const decryptedBytes = CryptoJS.AES.decrypt(encryptedApiKey, password);
      apiKey = decryptedBytes.toString(CryptoJS.enc.Utf8);
      if (!apiKey) {
        throw new Error('Decryption resulted in empty API key.');
      }
    } catch (e) {
      console.error('Decryption failed:', e);
      setError('Failed to decrypt API Key. Ensure the stored password is correct or re-set the API Key.');
      return;
    }

    if (!addressInput.trim()) {
      setError('Address cannot be empty.');
      return;
    }

    const encodedAddress = encodeURIComponent(addressInput);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`;

    try {
      const response = await axios.get(url);
      const { data } = response;

      if (data.results && data.results.length > 0 && data.status === 'OK') {
        const firstResult = data.results[0];
        if (firstResult.geometry && firstResult.geometry.location) {
          setCurrentSearchResult({
            lat: firstResult.geometry.location.lat,
            lng: firstResult.geometry.location.lng,
          });
        } else {
          setCurrentSearchResult(null);
        }
        setSearchResults(data.results);
        console.log('Geocoding results:', data.results);
      } else {
        setCurrentSearchResult(null);
        setSearchResults([]);
        if (data.status === 'ZERO_RESULTS') {
          setError('No results found for the specified address.');
        } else if (data.status === 'OVER_QUERY_LIMIT') {
          setError('API query limit reached. Please check your Google Cloud Console.');
        } else if (data.status === 'REQUEST_DENIED') {
          setError('Geocoding request denied. Check your API key and its permissions.');
        } else if (data.status === 'INVALID_REQUEST') {
          setError('Invalid request. Usually, this means the address or some parameter is missing.');
        } else if (data.status === 'UNKNOWN_ERROR') {
          setError('An unknown error occurred with the Geocoding service.');
        } else if (data.status === 'OK' && (!data.results || data.results.length === 0)) {
            setError('No results found for the address.');
        }
         else {
          setError(`Geocoding failed: ${data.status} - ${data.error_message || 'Unknown error'}`);
        }
      }
    } catch (err) {
      setCurrentSearchResult(null);
      console.error('Geocoding API request error:', err);
      if (axios.isAxiosError(err)) {
        if (err.response) {
          setError(`Error from server: ${err.response.status} - ${err.response.data?.error_message || err.message}`);
        } else if (err.request) {
          setError('Network error: Could not reach Geocoding service.');
        } else {
          setError(`Request setup error: ${err.message}`);
        }
      } else {
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
        sx={{ mb: 2 }}
      />
      <Button variant="contained" onClick={handleSearch} sx={{ mb: 2 }}>
        Search
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
