import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@pages':   resolve(__dirname, 'src/pages'),
      '@layouts': resolve(__dirname, 'src/components/layout'),
      '@hooks':   resolve(__dirname, 'src/hooks'),
      '@config':  resolve(__dirname, 'src/config'),
      '@api':     resolve(__dirname, 'src/api'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:5110', changeOrigin: true },
    },
  },
})