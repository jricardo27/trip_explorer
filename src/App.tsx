import React, { useEffect, useState } from "react"

import "./App.css"
import WelcomeModal from "./components/WelcomeModal/WelcomeModal"
import SavedFeaturesProvider from "./contexts/SavedFeaturesProvider"
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

  return (
    <>
      <SavedFeaturesProvider>
        <WesternAustralia />
      </SavedFeaturesProvider>
      <WelcomeModal open={open} onClose={handleClose} />
    </>
  )
}

export default App
