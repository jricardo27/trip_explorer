import { Box } from "@mui/material"
import React, { useEffect, useState } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"

import "./App.css"
import TopMenu from "./components/TopMenu/TopMenu"
import WelcomeModal from "./components/WelcomeModal/WelcomeModal"
import SavedFeaturesProvider from "./contexts/SavedFeaturesProvider"
import NotFound from "./pages/NotFound/NotFound.tsx"
import { WesternAustralia } from "./pages/WA/WesternAustralia"

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
