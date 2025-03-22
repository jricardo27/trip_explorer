import React, { useEffect, useState } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"

import "./App.css"
import WelcomeModal from "./components/WelcomeModal/WelcomeModal"
import SavedFeaturesProvider from "./contexts/SavedFeaturesProvider"
import NotFound from "./pages/NotFound/NotFound.tsx"
import { WesternAustralia } from "./pages/WA/WesternAustralia"

function App(): React.ReactNode {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const hasShownModal = localStorage.getItem("hasShownModal")
    if (!hasShownModal) {
      setOpen(true)
      // localStorage.setItem("hasShownModal", "true")
    }
  }, [])

  const handleClose = () => {
    setOpen(false)
  }

  const basename = import.meta.env.MODE === "production" ? "/online_trip_explorer" : "/"

  return (
    <BrowserRouter basename={basename}>
      <SavedFeaturesProvider>
        <Routes>
          <Route path="/" element={<WesternAustralia />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </SavedFeaturesProvider>
      <WelcomeModal open={open} onClose={handleClose} />
    </BrowserRouter>
  )
}

export default App
