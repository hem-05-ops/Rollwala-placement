import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: 5000,
    hmr: {
      // Remove clientPort or set it to match your server port
      clientPort: 5000, // Change this to match your server port
    },
    allowedHosts: 'all',
  },
}); 