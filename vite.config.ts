import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: true,
    port: 8080,
    hmr: { overlay: false },
  },
  preview: {
    port: 4173,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      // Service worker fica DESLIGADO em dev de propósito: SW em dev serve HTML
      // velho e faz perder tempo depurando bug que nao existe. So aparece no build.
      devOptions: { enabled: false },
      includeAssets: ["favicon.svg", "robots.txt"],
      manifest: {
        name: "Canal de Escuta",
        short_name: "Escuta",
        description: "Canal anonimo de escuta e denuncias. Voce pode relatar sem se identificar.",
        lang: "pt-BR",
        theme_color: "#2C5F5A",
        background_color: "#F1F4F1",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        icons: [
          { src: "/pwa-192.png", sizes: "192x192", type: "image/png" },
          { src: "/pwa-512.png", sizes: "512x512", type: "image/png" },
          { src: "/pwa-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        navigateFallback: "/index.html",
        globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
      },
    }),
  ],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
