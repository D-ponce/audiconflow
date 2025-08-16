import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tagger from "@dhiwise/component-tagger";

export default defineConfig({
  build: {
    outDir: "build",
    chunkSizeWarningLimit: 2000,
  },
  plugins: [tsconfigPaths(), react(), tagger()],
  resolve: {
    alias: {
      components: "/src/components",
      pages: "/src/pages",
    },
  },
  server: {
    port: 4028,
    host: "0.0.0.0",
    strictPort: false, // <-- más flexible si el puerto está ocupado
    allowedHosts: ['.amazonaws.com', '.builtwithrocket.new', 'localhost'],
  }
});
