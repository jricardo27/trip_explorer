import React from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import { ToastContainer } from "react-toastify"

import App from "./App.tsx"

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
    <ToastContainer />
  </React.StrictMode>,
)
