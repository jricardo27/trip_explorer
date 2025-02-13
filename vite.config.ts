import react from "@vitejs/plugin-react"
import { visualizer } from "rollup-plugin-visualizer"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  base: "",
  build: {
    rollupOptions: {
      external: [
        "axios",
        "file-saver",
        "jszip",
        "geojson-to-kml",
        "leaflet",
        "react",
        "react-image-gallery",
        "react-leaflet",
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
  plugins: [
    react(),
    visualizer({
      filename: "stats.html",
      open: true, // Open the stats page in browser
    }),
  ],
  server: {
    host: true,
    fs: {
      // Allow serving files from the public directory
      strict: false,
    },
  },
})
