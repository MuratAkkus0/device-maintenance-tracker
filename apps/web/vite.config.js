import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Allows the dev server to be reached from outside the container when
    // run via `docker compose up` (see apps/web/Dockerfile).
    host: true,
    port: 5173,
  },
});
