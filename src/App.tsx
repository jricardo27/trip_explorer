import { Box } from "@mui/material"
import React, { useEffect, useState } from "react"
import ReactGA from "react-ga4"
import { HashRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom"

import "./App.css"
import TopMenu from "./components/TopMenu/TopMenu"
import WelcomeModal from "./components/WelcomeModal/WelcomeModal"
import config from "./config"
import SavedFeaturesProvider from "./contexts/SavedFeaturesProvider"
import { TCurrentSearchResult } from "./data/types"
import { AustralianCapitalTerritory } from "./pages/Australia/AustralianCapitalTerritory"
import { NewSouthWales } from "./pages/Australia/NewSouthWales"
import { NorthernTerritory } from "./pages/Australia/NorthernTerritory"
import { Queensland } from "./pages/Australia/Queensland"
import { SouthAustralia } from "./pages/Australia/SouthAustralia"
import { Tasmania } from "./pages/Australia/Tasmania"
import { Victoria } from "./pages/Australia/Victoria"
import { WesternAustralia } from "./pages/Australia/WesternAustralia"
import Destinations from "./pages/Destinations/Destinations"
import { NewZealand } from "./pages/NewZealand/NewZealand"
import NotFound from "./pages/NotFound/NotFound"

const RedirectHandler = () => {
  const navigate = useNavigate()
  const location = useLocation()
  useEffect(() => {
    const referrer = sessionStorage.getItem("referrer")
    if (referrer) {
      sessionStorage.removeItem("referrer")

      // Check if we're on any valid route in the app
      if (location.pathname !== referrer) {
        navigate(referrer)
      }
    }
  }, [navigate, location])
  return null
}

function App(): React.ReactNode {
  const [welcomeDialogOpen, setWelcomeDialogOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [currentSearchResult, setCurrentSearchResult] = useState<TCurrentSearchResult>(null)

  ReactGA.initialize(config.ga.measurementId)

  useEffect(() => {
    const hasShownModal = localStorage.getItem("hasShownModal")
    if (!hasShownModal) {
      setWelcomeDialogOpen(true)
      // localStorage.setItem("hasShownModal", "true")
    }
  }, [])

  const handleClose = () => {
    setWelcomeDialogOpen(false)
  }

  const openDrawer = () => {
    setDrawerOpen(true)
  }

  const closeDrawer = () => {
    setDrawerOpen(false)
  }

  return (
    <HashRouter basename="">
      <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
        <RedirectHandler />
        <SavedFeaturesProvider>
          <TopMenu onMenuClick={openDrawer} setCurrentSearchResult={setCurrentSearchResult} />
          <Box sx={{ flexGrow: 1, overflow: "hidden" }}>
            <Routes>
              <Route path="/" element={<Destinations />} />
              <Route path="/australianCapitalTerritory" element={<AustralianCapitalTerritory drawerOpen={drawerOpen} closeDrawer={closeDrawer} currentSearchResult={currentSearchResult} />} />
              <Route path="/newSouthWales" element={<NewSouthWales drawerOpen={drawerOpen} closeDrawer={closeDrawer} currentSearchResult={currentSearchResult} />} />
              <Route path="/northernTerritory" element={<NorthernTerritory drawerOpen={drawerOpen} closeDrawer={closeDrawer} currentSearchResult={currentSearchResult} />} />
              <Route path="/queensland" element={<Queensland drawerOpen={drawerOpen} closeDrawer={closeDrawer} currentSearchResult={currentSearchResult} />} />
              <Route path="/southAustralia" element={<SouthAustralia drawerOpen={drawerOpen} closeDrawer={closeDrawer} currentSearchResult={currentSearchResult} />} />
              <Route path="/tasmania" element={<Tasmania drawerOpen={drawerOpen} closeDrawer={closeDrawer} currentSearchResult={currentSearchResult} />} />
              <Route path="/victoria" element={<Victoria drawerOpen={drawerOpen} closeDrawer={closeDrawer} currentSearchResult={currentSearchResult} />} />
              <Route path="/westernAustralia" element={<WesternAustralia drawerOpen={drawerOpen} closeDrawer={closeDrawer} currentSearchResult={currentSearchResult} />} />
              <Route path="/newZealand" element={<NewZealand drawerOpen={drawerOpen} closeDrawer={closeDrawer} currentSearchResult={currentSearchResult} />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Box>
        </SavedFeaturesProvider>
      </Box>
      <WelcomeModal open={welcomeDialogOpen} onClose={handleClose} />
    </HashRouter>
  )
}

export default App
