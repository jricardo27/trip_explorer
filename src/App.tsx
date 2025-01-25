import React from "react"

import "./App.css"
import MapComponent from "./components/MapComponent/MapComponent.tsx"

function App(): React.ReactNode {
  const PERTH_LOCATION = { lat: -31.953512, lng: 115.857048 }

  return (
    <>
      <MapComponent center={PERTH_LOCATION} />
    </>
  )
}

export default App
