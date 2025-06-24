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
  test: {
    globals: true, // Optional: to use vitest globals like describe, it, expect without importing
    environment: "jsdom",
    setupFiles: ["./setupVitest.js"], // Path to setup file
    css: true, // Enables processing CSS files if you import them in tests or components
    // Replicate moduleNameMapper for aliases and mocks if needed
    // Vitest uses Vite's resolve.alias for path aliases.
    // For specific file mocks, you might use manual mocks (__mocks__ directory)
    // or configure 'resolve.alias' for specific module paths.
    // For example, for image mocks:
    // alias: [
    //   { find: /\.(gif|ttf|eot|svg|png|webp)$/, replacement: '<rootDir>/__mocks__/fileMock.js' }
    // ]
    // However, Vitest often handles static assets out of the box or with plugins.
    // Let's rely on manual mocks for now for fileMock.js if direct imports are an issue.
  },
})
