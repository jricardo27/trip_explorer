import React from "react"

import "./App.css"
import SavedFeaturesProvider from "./contexts/SavedFeaturesProvider"
import { WesternAustralia } from "./pages/WA/WesternAustralia"

function App(): React.ReactNode {
  return (
    <>
      <SavedFeaturesProvider>
        <WesternAustralia />
      </SavedFeaturesProvider>
    </>
  )
}

export default App
