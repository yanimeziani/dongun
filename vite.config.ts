import { defineConfig } from "vite";

// The game is published to https://<user>.github.io/dongun/ on GitHub Pages,
// so every build (and the local dev/preview server) is served from the
// "/dongun/" sub-path. Keeping the base constant avoids dev/prod path drift.
export default defineConfig({
  base: "/dongun/",
  build: {
    chunkSizeWarningLimit: 1800,
  },
});
