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
    port: 3000,
    host: true,
<<<<<<< HEAD
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
      "/static": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
    },
  },

=======
  },
>>>>>>> 60a320c8e08cea17efa61a45f466bf68678a8569
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});
