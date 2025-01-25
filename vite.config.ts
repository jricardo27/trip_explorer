import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    fs: {
      // Allow serving files from the public directory
      strict: false,
    },
  },
})
