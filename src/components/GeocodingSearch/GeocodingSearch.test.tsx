import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import CryptoJS from 'crypto-js';
import axios from 'axios';
import GeocodingSearch from './GeocodingSearch';
import { TCurrentSearchResult } from '../../data/types';

// Mock CryptoJS
vi.mock('crypto-js', async () => {
  const originalCryptoJS = await vi.importActual('crypto-js') as any;
  return {
    default: {
      ...originalCryptoJS,
      AES: {
        ...originalCryptoJS.AES,
        encrypt: vi.fn((data, _pass) => ({ toString: vi.fn(() => `encrypted-${data}`) })),
        decrypt: vi.fn((ciphertextData, password) => {
          const ciphertextString = typeof ciphertextData === 'string' ? ciphertextData : ciphertextData.toString();
          return {
            toString: vi.fn((encoding) => {
              if (ciphertextString === 'encrypted-test-api-key' && password === 'correct-password') {
                return 'decrypted-test-api-key';
              } else if (ciphertextString === 'encrypted-test-api-key' && password === 'wrong-password') {
                return ''; // Simulate failed decryption (empty string due to wrong password)
              } else if (ciphertextString === 'bad-encrypted-key') {
                return ''; 
              }
              if (encoding === originalCryptoJS.enc.Utf8) {
                if(ciphertextString !== 'encrypted-test-api-key') {
                    return 'some-other-decrypted-value'
                }
              }
              return '';
            }),
          };
        }),
      },
      enc: { 
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
    setItem: (key: string, value: string) => { store[key] = value.toString(); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
};

let localStorageMock = localStorageMockFactory();

describe('GeocodingSearch', () => {
  let mockSetCurrentSearchResult: ReturnType<typeof vi.fn<(result: TCurrentSearchResult) => void>>;

  beforeEach(() => {
    localStorageMock.clear();
    vi.stubGlobal('localStorage', localStorageMock); // Make sure mock is applied for each test
    vi.clearAllMocks();
    mockSetCurrentSearchResult = vi.fn();
     // Reset axios mock before each test
    (axios.get as ReturnType<typeof vi.fn>).mockReset();
  });

  it('should show error if API key is not configured (no key in localStorage)', async () => {
    render(<GeocodingSearch setCurrentSearchResult={mockSetCurrentSearchResult} />);
    const searchButton = screen.getByRole('button', { name: /search address/i });
    await userEvent.type(screen.getByLabelText(/enter address/i), 'test address');
    fireEvent.click(searchButton);

    const snackbar = await screen.findByRole('alert');
    expect(snackbar).toHaveTextContent('API Key not configured.');
    expect(mockSetCurrentSearchResult).toHaveBeenCalledWith(null);
  });

  it('should show password prompt if API key exists but session password is not set', async () => {
    localStorageMock.setItem('googleEncryptedApiKey', 'encrypted-test-api-key');
    render(<GeocodingSearch setCurrentSearchResult={mockSetCurrentSearchResult} />);
    
    const addressInput = screen.getByLabelText(/enter address/i);
    await userEvent.type(addressInput, 'test address');
    const searchButton = screen.getByRole('button', { name: /search address/i });
    fireEvent.click(searchButton);

    expect(await screen.findByLabelText(/session password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /unlock api key/i })).toBeInTheDocument();
    expect(screen.getByText(/Please enter your password to unlock the Geocoding feature/i)).toBeInTheDocument();
  });

  it('should successfully search if password is provided and correct, then search button clicked', async () => {
    localStorageMock.setItem('googleEncryptedApiKey', 'encrypted-test-api-key');
    const mockApiResponse = {
      data: {
        status: 'OK',
        results: [{ formatted_address: '123 Test St', geometry: { location: { lat: 10, lng: 20 } } }],
      },
    };
    (axios.get as ReturnType<typeof vi.fn>).mockResolvedValue(mockApiResponse);

    render(<GeocodingSearch setCurrentSearchResult={mockSetCurrentSearchResult} />);
    
    // 1. Type address
    await userEvent.type(screen.getByLabelText(/enter address/i), '123 Test St');
    
    // 2. Initial search click (should show prompt)
    fireEvent.click(screen.getByRole('button', { name: /search address/i }));
    
    // 3. Enter password and unlock
    const passwordInput = await screen.findByLabelText(/session password/i);
    await userEvent.type(passwordInput, 'correct-password');
    fireEvent.click(screen.getByRole('button', { name: /unlock api key/i }));

    await waitFor(() => {
        expect(CryptoJS.AES.decrypt).toHaveBeenCalledWith('encrypted-test-api-key', 'correct-password');
    });

    // Wait for prompt to disappear (or error to clear if that was the case)
    await waitFor(() => {
      expect(screen.queryByLabelText(/session password/i)).not.toBeInTheDocument();
    });

    // 4. Click search again
    fireEvent.click(screen.getByRole('button', { name: /search address/i }));

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        'https://maps.googleapis.com/maps/api/geocode/json?address=123%20Test%20St&key=decrypted-test-api-key'
      );
      expect(mockSetCurrentSearchResult).toHaveBeenCalledWith({
        coordinate: { lat: 10, lng: 20 },
        address: '123 Test St',
      });
      expect(screen.getByText(/123 Test St/i)).toBeInTheDocument();
    });
  });

  it('should successfully search if password is provided and unlock via Enter key in password field', async () => {
    localStorageMock.setItem('googleEncryptedApiKey', 'encrypted-test-api-key');
    const mockApiResponse = {
      data: {
        status: 'OK',
        results: [{ formatted_address: '123 Enter St', geometry: { location: { lat: 12, lng: 22 } } }],
      },
    };
    (axios.get as ReturnType<typeof vi.fn>).mockResolvedValue(mockApiResponse);
  
    render(<GeocodingSearch setCurrentSearchResult={mockSetCurrentSearchResult} />);
    
    await userEvent.type(screen.getByLabelText(/enter address/i), '123 Enter St');
    fireEvent.click(screen.getByRole('button', { name: /search address/i })); // Show prompt
    
    const passwordInput = await screen.findByLabelText(/session password/i);
    await userEvent.type(passwordInput, 'correct-password');
    await act(async () => { // Wrap in act because Enter key press might trigger state updates that lead to search
        fireEvent.keyPress(passwordInput, { key: 'Enter', code: 'Enter', charCode: 13 });
    });
  
    await waitFor(() => {
      expect(CryptoJS.AES.decrypt).toHaveBeenCalledWith('encrypted-test-api-key', 'correct-password');
      expect(axios.get).toHaveBeenCalledWith(
        'https://maps.googleapis.com/maps/api/geocode/json?address=123%20Enter%20St&key=decrypted-test-api-key'
      );
      expect(mockSetCurrentSearchResult).toHaveBeenCalledWith({
        coordinate: { lat: 12, lng: 22 },
        address: '123 Enter St',
      });
      expect(screen.getByText(/123 Enter St/i)).toBeInTheDocument();
    });
  });


  it('should show error and prompt again if decryption fails due to wrong password', async () => { // Already async, this was not the issue.
    localStorageMock.setItem('googleEncryptedApiKey', 'encrypted-test-api-key');
    render(<GeocodingSearch setCurrentSearchResult={mockSetCurrentSearchResult} />);
    
    await userEvent.type(screen.getByLabelText(/enter address/i), 'any address');
    fireEvent.click(screen.getByRole('button', { name: /search address/i })); // Show prompt
    
    const passwordInput = await screen.findByLabelText(/session password/i);
    await userEvent.type(passwordInput, 'wrong-password');
    fireEvent.click(screen.getByRole('button', { name: /unlock api key/i }));

    await waitFor(() => {
      expect(CryptoJS.AES.decrypt).toHaveBeenCalledWith('encrypted-test-api-key', 'wrong-password');
    });
    });
    
    await waitFor(() => {
      // Use a regex to match the core part of the message, making it more resilient.
      expect(screen.getByText(/Invalid password or corrupted API key. Please re-enter password or re-set API Key./i)).toBeInTheDocument();
    }, { timeout: 3000 });
    expect(await screen.findByLabelText(/session password/i)).toBeInTheDocument(); // Prompt still there
    expect((passwordInput as HTMLInputElement).value).toBe(''); // Password field cleared
    expect(mockSetCurrentSearchResult).not.toHaveBeenCalledWith(expect.objectContaining({ address: expect.any(String) }));
  });


  it('should handle ZERO_RESULTS response after successful unlock', async () => {
    localStorageMock.setItem('googleEncryptedApiKey', 'encrypted-test-api-key');
    (axios.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { status: 'ZERO_RESULTS', results: [] } });

    render(<GeocodingSearch setCurrentSearchResult={mockSetCurrentSearchResult} />);
    await userEvent.type(screen.getByLabelText(/enter address/i), 'non existent address');
    fireEvent.click(screen.getByRole('button', { name: /search address/i })); 
    
    const passwordInput = await screen.findByLabelText(/session password/i);
    await userEvent.type(passwordInput, 'correct-password');
    fireEvent.click(screen.getByRole('button', { name: /unlock api key/i }));
    await waitFor(() => expect(screen.queryByLabelText(/session password/i)).not.toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /search address/i }));

    const snackbar = await screen.findByRole('alert');
    expect(snackbar).toHaveTextContent('No results found for the specified address.');
    expect(mockSetCurrentSearchResult).toHaveBeenCalledWith(null);
  });
  
  it('should handle REQUEST_DENIED response after successful unlock (e.g. bad API key after all)', async () => {
    localStorageMock.setItem('googleEncryptedApiKey', 'encrypted-test-api-key');
    (axios.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { status: 'REQUEST_DENIED', error_message: 'API key invalid.' } });
    
    render(<GeocodingSearch setCurrentSearchResult={mockSetCurrentSearchResult} />);
    await userEvent.type(screen.getByLabelText(/enter address/i), 'any address');
    fireEvent.click(screen.getByRole('button', { name: /search address/i }));

    const passwordInput = await screen.findByLabelText(/session password/i);
    await userEvent.type(passwordInput, 'correct-password'); // Assume this password decrypts to a key that Google then rejects
    fireEvent.click(screen.getByRole('button', { name: /unlock api key/i }));
    await waitFor(() => expect(screen.queryByLabelText(/session password/i)).not.toBeInTheDocument());
    
    fireEvent.click(screen.getByRole('button', { name: /search address/i }));

    const snackbar = await screen.findByRole('alert');
    // The component logic might reset and ask for password again if REQUEST_DENIED is due to bad key from decryption
    expect(snackbar).toHaveTextContent('Geocoding request denied. Check API key or password if prompted.');
    expect(mockSetCurrentSearchResult).toHaveBeenCalledWith(null);
    // It might also re-prompt for password if it suspects the key was bad due to decryption
    // This depends on exact logic in handleSearch for REQUEST_DENIED
  });

  it('should handle network error from axios after successful unlock', async () => {
    localStorageMock.setItem('googleEncryptedApiKey', 'encrypted-test-api-key');
    (axios.get as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network Error'));

    render(<GeocodingSearch setCurrentSearchResult={mockSetCurrentSearchResult} />);
    await userEvent.type(screen.getByLabelText(/enter address/i), 'any address');
    fireEvent.click(screen.getByRole('button', { name: /search address/i })); 

    const passwordInput = await screen.findByLabelText(/session password/i);
    await userEvent.type(passwordInput, 'correct-password');
    fireEvent.click(screen.getByRole('button', { name: /unlock api key/i }));
    await waitFor(() => expect(screen.queryByLabelText(/session password/i)).not.toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /search address/i }));
    
    await waitFor(() => {
      const snackbar = screen.getByRole('alert');
      expect(snackbar).toHaveTextContent('Error during geocoding. The decrypted API key might be invalid or network issue. Please check password or re-set API Key, and check network.');
    }, {timeout: 3000});
    
    expect(mockSetCurrentSearchResult).toHaveBeenCalledWith(null);
     // Expect password prompt to show again
    expect(await screen.findByLabelText(/session password/i)).toBeInTheDocument();
  });
});
