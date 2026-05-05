import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // 'host: true' allows access from your mobile/other devices on the same network
    host: true, 
    port: 5173,
    // HMR (Hot Module Replacement) can sometimes fail over tunnels, 
    // adding this ensures the connection stays stable.
    hmr: {
      clientPort: 5173,
    },
    proxy: {
      // Directs all frontend calls starting with /api to your backend
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})