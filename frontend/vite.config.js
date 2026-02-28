import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      "/wallpaper": "http://localhost:5001",
      "/api": "http://localhost:5001",
    },
  },
  build: {
    outDir: "../backend/static/dist",
    emptyOutDir: true,
  },
});
