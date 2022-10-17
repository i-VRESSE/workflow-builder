import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: [ 'es2020' ]
    ,sourcemap: true
  },
  server: {
    port: 3001
  },
  optimizeDeps: {
    esbuildOptions: {
      target: [ 'es2020' ],
    }
  },
  // TODO mention base in docs
  base: '/static/plugins/visualizations/haddock3/static/'
})
