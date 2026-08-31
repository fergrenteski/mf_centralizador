import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";

// ============================================================
// URLs dos dois remotes (Azure Static Apps).
// IMPORTANTE: o remoteEntry.js do Vite fica em /assets/remoteEntry.js
// ============================================================
const PAINEL_URL = "https://kind-beach-0aa0a8510.3.azurestaticapps.net"; // expõe ./PainelAtendente
const FILA_URL = "https://white-field-0bf9c1410.6.azurestaticapps.net"; // expõe ./ConsultaFila

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "host",
      remotes: {
        // alias: <url>/assets/remoteEntry.js
        painel: `${PAINEL_URL}/assets/remoteEntry.js`,
        fila: `${FILA_URL}/assets/remoteEntry.js`,
      },
      shared: ["react", "react-dom"],
    }),
  ],
  // O plugin de federation do Vite exige target moderno.
  build: {
    target: "esnext",
    minify: false,
    cssCodeSplit: false,
  },
  server: { port: 3000 },
  preview: { port: 3000 },
});
