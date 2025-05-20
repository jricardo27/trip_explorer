import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import CryptoJS from 'crypto-js';
import axios from 'axios';
import GeocodingSearch from './GeocodingSearch'; // Adjust path as necessary
import { TCoordinate } from '../../data/types'; // Adjust path

// Mock CryptoJS
// To correctly mock modules with default exports when using `import CryptoJS from 'crypto-js'`
vi.mock('crypto-js', async () => {
  const originalCryptoJS = await vi.importActual('crypto-js') as any;
  return {
    default: { // This is the key change for default exports
      ...originalCryptoJS,
      AES: {
        ...originalCryptoJS.AES,
        encrypt: vi.fn((data, _pass) => ({ toString: vi.fn(() => `encrypted-${data}`) })),
        decrypt: vi.fn((ciphertextData, _pass) => {
          // The actual ciphertext is usually an object, not a plain string.
          // We need to simulate its toString method.
          const ciphertextString = typeof ciphertextData === 'string' ? ciphertextData : ciphertextData.toString();
          
          return {
            toString: vi.fn((encoding) => {
              if (ciphertextString === 'encrypted-test-api-key') {
                return 'decrypted-test-api-key';
              } else if (ciphertextString === 'bad-encrypted-key') {
                return ''; // Simulate failed decryption (empty string)
              }
              // Simulate a case where decryption results in an error or unreadable output
              // For a more robust mock, you might need to inspect the password or throw an error
              // For this test, let's assume 'bad-encrypted-key' specifically leads to empty string.
              // All other non-matching ciphertexts could be treated as if they decrypt to something,
              // or throw an error if that's more representative of crypto-js behavior on bad password.
              // For now, if it's not a known "bad" key, let's assume it's a different valid key.
              // This part might need refinement based on how robust the error checking in the component is.
              if (encoding === originalCryptoJS.enc.Utf8) {
                 // if not a known bad key, and not the expected good key, simulate some other decrypted value
                if(ciphertextString !== 'encrypted-test-api-key') {
                    return 'some-other-decrypted-value-if-needed-for-other-tests'
                }
              }
              // Fallback for other encodings or unhandled cases
              return ''; // Or throw new Error('Mock Decryption error for unknown ciphertext');
            }),
          };
        }),
      },
      enc: { // Make sure 'enc.Utf8' is available
        ...originalCryptoJS.enc,
        Utf8: originalCryptoJS.enc.Utf8,
      }
    }
  };
});

// Mock axios
vi.mock('axios');

// Mock localStorage
const localStorageMockFactory = () => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key:string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    getStore: () => store, 
  };
};

let localStorageMock = localStorageMockFactory();
vi.stubGlobal('localStorage', localStorageMock);


describe('GeocodingSearch', () => {
  let mockSetCurrentSearchResult: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks(); // Clear all vi mocks including axios
    mockSetCurrentSearchResult = vi.fn();
  });

  afterEach(() => {
    localStorageMock.clear();
  });

  // Unit Test for Decryption
  it('should attempt to decrypt API key if found in localStorage', async () => {
    localStorageMock.setItem('googleApiKey', 'encrypted-test-api-key');
    localStorageMock.setItem('googleApiKeyPassword', 'test-password');

    render(<GeocodingSearch setCurrentSearchResult={mockSetCurrentSearchResult} />);
    
    const addressInput = screen.getByLabelText(/enter address/i);
    const searchButton = screen.getByRole('button', { name: /search/i });

    await userEvent.type(addressInput, 'test address');
    fireEvent.click(searchButton);

    expect(CryptoJS.AES.decrypt).toHaveBeenCalledWith('encrypted-test-api-key', 'test-password');
  });

  // Component Tests
  it('should show error if API key is not configured', async () => {
    render(<GeocodingSearch setCurrentSearchResult={mockSetCurrentSearchResult} />);
    const searchButton = screen.getByRole('button', { name: /search/i });
    await userEvent.type(screen.getByLabelText(/enter address/i), 'test address');
    fireEvent.click(searchButton);

    const snackbar = await screen.findByRole('alert');
    expect(snackbar).toHaveTextContent('API Key not configured.');
    expect(mockSetCurrentSearchResult).toHaveBeenCalledWith(null);
  });

  it('should show error if API key decryption fails', async () => {
    localStorageMock.setItem('googleApiKey', 'bad-encrypted-key'); // This will lead to empty decrypted key
    localStorageMock.setItem('googleApiKeyPassword', 'wrong-password');
    
    render(<GeocodingSearch setCurrentSearchResult={mockSetCurrentSearchResult} />);
    const searchButton = screen.getByRole('button', { name: /search/i });
    await userEvent.type(screen.getByLabelText(/enter address/i), 'test address');
    fireEvent.click(searchButton);

    const snackbar = await screen.findByRole('alert');
    expect(snackbar).toHaveTextContent('Failed to decrypt API Key.');
    expect(mockSetCurrentSearchResult).toHaveBeenCalledWith(null);
  });

  it('should call axios.get with correct URL and handle successful response (OK)', async () => {
    localStorageMock.setItem('googleApiKey', 'encrypted-test-api-key');
    localStorageMock.setItem('googleApiKeyPassword', 'test-password');
    
    const mockSuccessResponse = {
      data: {
        status: 'OK',
        results: [
          { formatted_address: '123 Main St', geometry: { location: { lat: 10, lng: 20 } } },
        ],
      },
    };
    (axios.get as ReturnType<typeof vi.fn>).mockResolvedValue(mockSuccessResponse);

    render(<GeocodingSearch setCurrentSearchResult={mockSetCurrentSearchResult} />);
    const addressInput = screen.getByLabelText(/enter address/i);
    const searchButton = screen.getByRole('button', { name: /search/i });

    await userEvent.type(addressInput, '123 Main St');
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        'https://maps.googleapis.com/maps/api/geocode/json?address=123%20Main%20St&key=decrypted-test-api-key'
      );
      expect(mockSetCurrentSearchResult).toHaveBeenCalledWith({ lat: 10, lng: 20 });
      expect(screen.getByText(/123 Main St/i)).toBeInTheDocument();
    });
  });

  it('should handle ZERO_RESULTS response', async () => {
    localStorageMock.setItem('googleApiKey', 'encrypted-test-api-key');
    localStorageMock.setItem('googleApiKeyPassword', 'test-password');

    const mockZeroResultsResponse = { data: { status: 'ZERO_RESULTS', results: [] } };
    (axios.get as ReturnType<typeof vi.fn>).mockResolvedValue(mockZeroResultsResponse);

    render(<GeocodingSearch setCurrentSearchResult={mockSetCurrentSearchResult} />);
    await userEvent.type(screen.getByLabelText(/enter address/i), 'non existent address');
    fireEvent.click(screen.getByRole('button', { name: /search/i }));

    const snackbar = await screen.findByRole('alert');
    expect(snackbar).toHaveTextContent('No results found for the specified address.');
    expect(mockSetCurrentSearchResult).toHaveBeenCalledWith(null);
    expect(screen.queryByText(/Results:/i)).not.toBeInTheDocument();
  });
  
  it('should handle REQUEST_DENIED response', async () => {
    localStorageMock.setItem('googleApiKey', 'encrypted-test-api-key');
    localStorageMock.setItem('googleApiKeyPassword', 'test-password');

    const mockDeniedResponse = { data: { status: 'REQUEST_DENIED', error_message: 'API key invalid.' } };
    (axios.get as ReturnType<typeof vi.fn>).mockResolvedValue(mockDeniedResponse);
    
    render(<GeocodingSearch setCurrentSearchResult={mockSetCurrentSearchResult} />);
    await userEvent.type(screen.getByLabelText(/enter address/i), 'any address');
    fireEvent.click(screen.getByRole('button', { name: /search/i }));

    const snackbar = await screen.findByRole('alert');
    expect(snackbar).toHaveTextContent('Geocoding request denied. Check your API key and its permissions.');
    expect(mockSetCurrentSearchResult).toHaveBeenCalledWith(null);
  });

  it('should handle network error from axios', async () => {
    localStorageMock.setItem('googleApiKey', 'encrypted-test-api-key');
    localStorageMock.setItem('googleApiKeyPassword', 'test-password');

    (axios.get as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network Error'));

    render(<GeocodingSearch setCurrentSearchResult={mockSetCurrentSearchResult} />);
    await userEvent.type(screen.getByLabelText(/enter address/i), 'any address');
    fireEvent.click(screen.getByRole('button', { name: /search/i }));

    const snackbar = await screen.findByRole('alert');
    // This message comes from the generic catch block in handleSearch
    expect(snackbar).toHaveTextContent('An unexpected error occurred during geocoding.'); 
    expect(mockSetCurrentSearchResult).toHaveBeenCalledWith(null);
  });
});
