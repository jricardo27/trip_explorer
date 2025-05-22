import '@testing-library/jest-dom/vitest'
import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest'
import { render, screen, cleanup, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'

import TopMenu from './TopMenu'
// Import the functions that will be mocked
import { saveAsGeoJson } from './saveAsGeoJson'
import { saveAsKml } from './saveAsKml'
import { saveAsBackup } from './saveAsBackup'
import { importBackup } from './importBackup'

import SavedFeaturesContext, { SavedFeaturesContextType, SavedFeaturesStateType, DEFAULT_CATEGORY } from '../../contexts/SavedFeaturesContext'

// Mock imported utility functions
vi.mock('./saveAsGeoJson', () => ({ saveAsGeoJson: vi.fn() }))
vi.mock('./saveAsKml', () => ({ saveAsKml: vi.fn() }))
vi.mock('./saveAsBackup', () => ({ saveAsBackup: vi.fn() }))
vi.mock('./importBackup', () => ({ importBackup: vi.fn() }))

vi.mock('../WelcomeModal/WelcomeModal', () => ({
  default: vi.fn(({ open }) => open ? <div data-testid="mock-welcome-modal">Mock Welcome Modal</div> : null),
}))

const mockSavedFeatures: SavedFeaturesStateType = {
  [DEFAULT_CATEGORY]: [],
};
const mockSetSavedFeatures = vi.fn();
const mockAddFeature = vi.fn();
const mockRemoveFeature = vi.fn();
const mockUpdateFeature = vi.fn();
const mockSaveToLocalStorage = vi.fn();
const mockLoadFromLocalStorage = vi.fn();

const mockContextValue: SavedFeaturesContextType = {
  savedFeatures: mockSavedFeatures,
  setSavedFeatures: mockSetSavedFeatures,
  addFeature: mockAddFeature,
  removeFeature: mockRemoveFeature,
  updateFeature: mockUpdateFeature,
  saveToLocalStorage: mockSaveToLocalStorage,
  loadFromLocalStorage: mockLoadFromLocalStorage,
};

const renderTopMenuWithContext = (onMenuClick: () => void) => {
  return render(
    <MemoryRouter>
      <SavedFeaturesContext.Provider value={mockContextValue}>
        <TopMenu onMenuClick={onMenuClick} />
      </SavedFeaturesContext.Provider>
    </MemoryRouter>
  );
};

describe('TopMenu component', () => {
  const onMenuClickMock = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks() 
  })

  afterEach(() => {
    cleanup();
  })

  it('renders successfully with title and main buttons', () => {
    renderTopMenuWithContext(onMenuClickMock)
    expect(screen.getByText('Trip Explorer')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Saved Features/i })).toBeInTheDocument() 
    expect(screen.getByRole('button', { name: /Export/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Import/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Destinations/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Help/i })).toBeInTheDocument()
  })

  it('calls onMenuClick when the menu button (Saved Features) is clicked', async () => {
    renderTopMenuWithContext(onMenuClickMock)
    const menuButton = screen.getByRole('button', { name: /Saved Features/i })
    await userEvent.click(menuButton)
    expect(onMenuClickMock).toHaveBeenCalledTimes(1)
  })

  describe('Save As (Export) menu interactions', () => {
    it('opens the "Export" dropdown menu and shows options', async () => {
      renderTopMenuWithContext(onMenuClickMock)
      const exportButton = screen.getByRole('button', { name: /Export/i })
      await userEvent.click(exportButton)
      expect(await screen.findByText('To GeoJson')).toBeInTheDocument()
      expect(screen.getByText('To KML')).toBeInTheDocument()
      expect(screen.getByText('Export backup')).toBeInTheDocument()
    })

    it('calls saveAsGeoJson when "To GeoJson" menu item is clicked', async () => {
      renderTopMenuWithContext(onMenuClickMock)
      await userEvent.click(screen.getByRole('button', { name: /Export/i }))
      const geoJsonItem = await screen.findByText('To GeoJson')
      await userEvent.click(geoJsonItem)
      expect(saveAsGeoJson).toHaveBeenCalledTimes(1)
      expect(saveAsGeoJson).toHaveBeenCalledWith(mockSavedFeatures)
    })

    it('calls saveAsKml when "To KML" menu item is clicked', async () => {
      renderTopMenuWithContext(onMenuClickMock)
      await userEvent.click(screen.getByRole('button', { name: /Export/i }))
      const kmlItem = await screen.findByText('To KML')
      await userEvent.click(kmlItem)
      expect(saveAsKml).toHaveBeenCalledTimes(1)
      expect(saveAsKml).toHaveBeenCalledWith(mockSavedFeatures)
    })

    it('calls saveAsBackup when "Export backup" menu item is clicked', async () => {
      renderTopMenuWithContext(onMenuClickMock)
      await userEvent.click(screen.getByRole('button', { name: /Export/i }))
      const backupItem = await screen.findByText('Export backup')
      await userEvent.click(backupItem)
      expect(saveAsBackup).toHaveBeenCalledTimes(1)
      expect(saveAsBackup).toHaveBeenCalledWith(mockSavedFeatures)
    })
  })

  describe('Import menu interactions', () => {
    it('opens the "Import" dropdown menu and shows options', async () => {
        renderTopMenuWithContext(onMenuClickMock);
        const importButton = screen.getByRole('button', { name: /Import/i });
        await userEvent.click(importButton);
        expect(await screen.findByText('Override existing POIs')).toBeInTheDocument();
        expect(screen.getByText('Append categories')).toBeInTheDocument();
        expect(screen.getByText('Merge Categories')).toBeInTheDocument();
    });
    
    it('calls importBackup with "override" when "Override existing POIs" is clicked', async () => {
      renderTopMenuWithContext(onMenuClickMock)
      await userEvent.click(screen.getByRole('button', { name: /Import/i }))
      const overrideItem = await screen.findByText('Override existing POIs')
      await userEvent.click(overrideItem)
      expect(importBackup).toHaveBeenCalledTimes(1)
      expect(importBackup).toHaveBeenCalledWith("override", mockSetSavedFeatures)
    })

    it('calls importBackup with "append" when "Append categories" is clicked', async () => {
      renderTopMenuWithContext(onMenuClickMock)
      await userEvent.click(screen.getByRole('button', { name: /Import/i }))
      const appendItem = await screen.findByText('Append categories')
      await userEvent.click(appendItem)
      expect(importBackup).toHaveBeenCalledTimes(1)
      expect(importBackup).toHaveBeenCalledWith("append", mockSetSavedFeatures)
    })

    it('calls importBackup with "merge" when "Merge Categories" is clicked', async () => {
      renderTopMenuWithContext(onMenuClickMock)
      await userEvent.click(screen.getByRole('button', { name: /Import/i }))
      const mergeItem = await screen.findByText('Merge Categories')
      await userEvent.click(mergeItem)
      expect(importBackup).toHaveBeenCalledTimes(1)
      expect(importBackup).toHaveBeenCalledWith("merge", mockSetSavedFeatures)
    })
  })

  it('opens the WelcomeModal when Help button is clicked', async () => {
    renderTopMenuWithContext(onMenuClickMock);
    const helpButton = screen.getByRole('button', { name: /Help/i });
    await userEvent.click(helpButton);
    expect(screen.getByTestId('mock-welcome-modal')).toBeInTheDocument();
  });

  it('opens and closes the Destinations menu', async () => {
    renderTopMenuWithContext(onMenuClickMock);
    const destinationsButton = screen.getByRole('button', { name: /Destinations/i });
    
    await userEvent.click(destinationsButton);
    expect(await screen.findByText('Australia')).toBeInTheDocument(); 
    expect(screen.getByText('New South Wales')).toBeInTheDocument(); 

    const nswLink = screen.getByText('New South Wales');
    await userEvent.click(nswLink);

    await waitFor(() => {
      expect(screen.queryByText('New South Wales')).not.toBeInTheDocument();
    });
  });
})
