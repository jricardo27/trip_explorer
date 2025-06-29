import '@testing-library/jest-dom/vitest' // For toBeInTheDocument
import { describe, it, expect, beforeEach, afterEach, vi, SpyInstance, Mock } from 'vitest'
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import React from 'react'

import App from './App'

// Import the modules to be mocked for type casting and clearing
import TopMenu from './components/TopMenu/TopMenu';
import Destinations from './pages/Destinations/Destinations';
import { WesternAustralia } from './pages/Australia/WesternAustralia'; // Named import
import WelcomeModal from './components/WelcomeModal/WelcomeModal';
import ReactGA from 'react-ga4'; // Import ReactGA for clearing its mocks

// 1. Mock child components
vi.mock('./components/TopMenu/TopMenu', () => ({
  default: vi.fn(() => <div data-testid="mock-top-menu">TopMenu</div>),
}))
vi.mock('./pages/Destinations/Destinations', () => ({
  default: vi.fn(() => <div data-testid="mock-destinations-page">Destinations Page</div>),
}))
vi.mock('./pages/Australia/WesternAustralia', () => ({
  WesternAustralia: vi.fn(() => <div data-testid="mock-western-australia-page">Western Australia Page</div>),
}))
vi.mock('./components/WelcomeModal/WelcomeModal', () => ({
  default: vi.fn(({ open, onClose }) => open ? <div data-testid="mock-welcome-modal" onClick={onClose}>WelcomeModal</div> : null),
}));

// 2. Mock react-ga4
vi.mock('react-ga4', () => ({
  default: {
    initialize: vi.fn(),
    send: vi.fn(),
  },
}));

// 3. Mock HashRouter from react-router-dom
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    HashRouter: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

// 4. Mock src/config.ts
vi.mock('./config', () => ({
  default: {
    ga: {
      measurementId: 'G-TESTID', // Provide a dummy ID
    },
  },
}));

describe('App component', () => {
  let localStorageMock: {
    getItem: SpyInstance<[key: string], string | null>;
    setItem: SpyInstance<[key: string, value: string], void>;
  };
  let sessionStorageMock: {
    getItem: SpyInstance<[key: string], string | null>;
    setItem: SpyInstance<[key: string, value: string], void>;
    removeItem: SpyInstance<[key: string], void>;
  };

  beforeEach(() => {
    // Mock localStorage
    const lsStore: Record<string, string> = {};
    localStorageMock = {
      getItem: vi.fn((key: string) => lsStore[key] || null),
      setItem: vi.fn((key: string, value: string) => { lsStore[key] = value; }),
    } as any; 
    vi.stubGlobal('localStorage', localStorageMock);

    // Mock sessionStorage
    const ssStore: Record<string, string> = {};
    sessionStorageMock = {
      getItem: vi.fn((key: string) => ssStore[key] || null),
      setItem: vi.fn((key: string, value: string) => { ssStore[key] = value; }),
      removeItem: vi.fn((key: string) => { delete ssStore[key]; }),
    } as any;
    vi.stubGlobal('sessionStorage', sessionStorageMock);

    // Reset mocks for components
    (TopMenu as Mock).mockClear();
    (Destinations as Mock).mockClear();
    (WesternAustralia as Mock).mockClear(); 
    (WelcomeModal as Mock).mockClear();
    
    // Reset react-ga4 mocks
    (ReactGA.initialize as Mock).mockClear();
    (ReactGA.send as Mock).mockClear();
  });

  afterEach(() => {
    cleanup(); 
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  const renderApp = (initialRoute = '/') => {
    return render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <App />
      </MemoryRouter>
    );
  };

  it('renders successfully and TopMenu is present', () => {
    renderApp();
    expect(screen.getByTestId('mock-top-menu')).toBeInTheDocument();
  });

  it('renders TopMenu component initially and mock is called', () => {
    renderApp();
    expect(screen.getByTestId('mock-top-menu')).toBeInTheDocument();
    expect(TopMenu).toHaveBeenCalled();
  });

  it('renders Destinations component for the default route "/"', async () => {
    renderApp('/');
    await waitFor(() => {
        expect(screen.getByTestId('mock-destinations-page')).toBeInTheDocument();
    });
  });

  describe('WelcomeModal behavior', () => {
    it('appears when localStorage has no "hasShownModal" item', async () => {
      localStorageMock.getItem.mockReturnValue(null); 
      renderApp('/');
      await waitFor(() => {
        expect(screen.getByTestId('mock-welcome-modal')).toBeInTheDocument();
      });
      expect(localStorageMock.setItem).toHaveBeenCalledWith('hasShownModal', 'true');
    });

    it('does not appear when localStorage has "hasShownModal" set to "true"', async () => {
      localStorageMock.setItem('hasShownModal', 'true'); 
      localStorageMock.getItem.mockImplementation((key) => (key === 'hasShownModal' ? 'true' : null));

      renderApp('/');
      
      expect(screen.queryByTestId('mock-welcome-modal')).not.toBeInTheDocument();

      // Check that setItem was called for 'hasShownModal' only once (during setup)
      const setItemCalls = localStorageMock.setItem.mock.calls;
      const hasShownModalCallCount = setItemCalls.filter(call => call[0] === 'hasShownModal').length;
      expect(hasShownModalCallCount).toBe(1); 
      
      // Optionally, verify that the provider did its job for 'savedFeatures'
      const savedFeaturesCallCount = setItemCalls.filter(call => call[0] === 'savedFeatures').length;
      expect(savedFeaturesCallCount).toBeGreaterThanOrEqual(1); 
    });
  });

  describe('Routing functionality', () => {
    it('navigates to /westernAustralia and renders the WesternAustralia page', async () => {
      renderApp('/westernAustralia');
      await waitFor(() => {
        expect(screen.getByTestId('mock-western-australia-page')).toBeInTheDocument();
      });
      expect(screen.queryByTestId('mock-destinations-page')).not.toBeInTheDocument();
    });
  });
});
