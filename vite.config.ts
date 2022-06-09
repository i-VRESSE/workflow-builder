import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: [ 'es2020' ]
  },
  test: {
    coverage: {
      reporter: ['text', 'html', 'lcovonly']
    },
    exclude: ['**/node_modules/**', '**/dist/**', '**/cypress/**', '**/.{idea,git,cache,output,temp}/**', '**/integration-tests/**']
  }
})
