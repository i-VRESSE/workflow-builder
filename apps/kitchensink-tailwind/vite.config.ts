import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: [ 'es2020' ],
  },
  server: {
    port: 3003
  },
  optimizeDeps: {
    esbuildOptions: {
      target: [ 'es2020' ],
    }
  }
})