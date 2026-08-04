import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";

export default defineConfig({
  envDir: "../",
  plugins: [
    tanstackStart(),
    nitro({ preset: "node-server" }),
    react(),
    tailwindcss(),
    tsconfigPaths(),
  ],
  server: {
    port: 3001,
    host: true,
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});
