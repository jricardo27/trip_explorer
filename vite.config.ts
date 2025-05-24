/// <reference types="vitest" />
import react from "@vitejs/plugin-react"
import { visualizer } from "rollup-plugin-visualizer"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  base: "",
  plugins: [
    react(),
    visualizer({
      filename: "stats.html",
      open: true, // Open the stats page in browser
    }),
  ],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts",
    css: true, // if you have global css imports
  },
  build: {
    rollupOptions: {
      external: [
        "axios",
        "file-saver",
        "jszip",
        "geojson-to-kml",
        "leaflet",
        "react",
        "react-ga4",
        "react-image-gallery",
        "react-leaflet",
        "react-router-dom",
        "tinymce",
        "turndown",
        "uuid",
        /^@dnd-kit\/.*/,
        /^@emotion\/.*/,
        /^@mui\/.*/,
        /^@tinymce\/.*/,
        /^react-dom\/?.*/,
        /^react\/jsx-runtime/,
        /^react-toastify\/?.*/,
      ],
    },
  },
  server: {
    host: true,
    fs: {
      // Allow serving files from the public directory
      strict: false,
    },
  },
})
