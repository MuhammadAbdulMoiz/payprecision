import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    open: false,
    proxy: {
      // Forward all /api requests to the Express backend in dev mode
      '/api': 'http://localhost:3001',
    },
  },
})
