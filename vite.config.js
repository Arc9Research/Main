import { defineConfig } from "vite";
import { resolve } from "node:path";

// Set VITE_BASE for GitHub Pages project sites (e.g. /Main/). Default '/' for apex hosting.
const base = process.env.VITE_BASE || "/";

export default defineConfig({
  base,
  root: ".",
  publicDir: "public",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        experiment: resolve(__dirname, "experiment.html"),
      },
    },
  },
});