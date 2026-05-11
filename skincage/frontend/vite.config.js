import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Output al directorio static de Django
    outDir: '../static/react',
    emptyOutDir: true,
    rollupOptions: {
      // Múltiples entry points (MPA)
      input: {
        skinModal: resolve(__dirname, 'src/entries/skinModal.jsx'),
        profileApp: resolve(__dirname, 'src/entries/profileApp.jsx'),
        registerForm: resolve(__dirname, 'src/entries/registerForm.jsx'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
  // Para desarrollo: proxy a Django
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8000',
      '/skins': 'http://localhost:8000',
    },
  },
})
