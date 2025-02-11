import react from "@vitejs/plugin-react"
import { visualizer } from "rollup-plugin-visualizer"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  base: "",
  build: {
    rollupOptions: {
      external: [
        /^@emotion\/.*/,
        "axios",
        "file-saver",
        "jszip",
        "leaflet",
        /^@mui\/.*/,
        /^react(-dom)?\/?.*/,
        /^react-(image-gallery)$/,
        "tinymce",
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
