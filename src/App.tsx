import React from "react"

import "./App.css"
import SavedFeaturesProvider from "./contexts/SavedFeaturesProvider.tsx"
import { WesternAustralia } from "./pages/WA/WesternAustralia.tsx"

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
