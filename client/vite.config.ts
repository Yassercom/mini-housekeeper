import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: '0.0.0.0', // Permet l'accès depuis d'autres machines sur le réseau local
    proxy: {
      '/api': {
        target: `http://${process.env.VITE_LOCAL_IP || '127.0.0.1'}:5000`, // Utilise la variable d'environnement ou adresse locale par défaut
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path
      }
    }
  }
})
