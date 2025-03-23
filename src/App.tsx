import { Box } from "@mui/material"
import React, { useEffect, useState } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"

import "./App.css"
import TopMenu from "./components/TopMenu/TopMenu"
import WelcomeModal from "./components/WelcomeModal/WelcomeModal"
import SavedFeaturesProvider from "./contexts/SavedFeaturesProvider"
import { AustralianCapitalTerritory } from "./pages/Australia/AustralianCapitalTerritory"
import { NewSouthWales } from "./pages/Australia/NewSouthWales"
import { NorthernTerritory } from "./pages/Australia/NorthernTerritory"
import { Queensland } from "./pages/Australia/Queensland"
import { SouthAustralia } from "./pages/Australia/SouthAustralia"
import { Tasmania } from "./pages/Australia/Tasmania"
import { Victoria } from "./pages/Australia/Victoria"
import { WesternAustralia } from "./pages/Australia/WesternAustralia"
import { NewZealand } from "./pages/NewZealand/NewZealand"
import NotFound from "./pages/NotFound/NotFound"

function App(): React.ReactNode {
  const [welcomeDialogOpen, setWelcomeDialogOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

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

  const basename = import.meta.env.MODE === "production" ? "/online_trip_explorer" : "/"

  return (
    <BrowserRouter basename={basename}>
      <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
        <SavedFeaturesProvider>
          <TopMenu onMenuClick={openDrawer} />
          <Box sx={{ flexGrow: 1, overflow: "hidden" }}>
            <Routes>
              <Route path="/" element={<WesternAustralia drawerOpen={drawerOpen} closeDrawer={closeDrawer} />} />
              <Route path="/newSouthWales" element={<NewSouthWales drawerOpen={drawerOpen} closeDrawer={closeDrawer} />} />
              <Route path="/victoria" element={<Victoria drawerOpen={drawerOpen} closeDrawer={closeDrawer} />} />
              <Route path="/queensland" element={<Queensland drawerOpen={drawerOpen} closeDrawer={closeDrawer} />} />
              <Route path="/southAustralia" element={<SouthAustralia drawerOpen={drawerOpen} closeDrawer={closeDrawer} />} />
              <Route path="/tasmania" element={<Tasmania drawerOpen={drawerOpen} closeDrawer={closeDrawer} />} />
              <Route path="/northernTerritory" element={<NorthernTerritory drawerOpen={drawerOpen} closeDrawer={closeDrawer} />} />
              <Route path="/australianCapitalTerritory" element={<AustralianCapitalTerritory drawerOpen={drawerOpen} closeDrawer={closeDrawer} />} />
              <Route path="/newZealand" element={<NewZealand drawerOpen={drawerOpen} closeDrawer={closeDrawer} />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Box>
        </SavedFeaturesProvider>
      </Box>
      <WelcomeModal open={welcomeDialogOpen} onClose={handleClose} />
    </BrowserRouter>
  )
}

export default App
