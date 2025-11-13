// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,          // allow access from your LAN (0.0.0.0)
    port: 5173,          // optional
    strictPort: true,    // optional; fail if 5173 is taken
    proxy: {
      '/api': { target: 'http://172.20.175.68:8002', changeOrigin: true },
      '//ws':  { target: 'ws://172.20.175.68:8002', ws: true, changeOrigin: true }
    }
  }
})
