import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import dts from "vite-plugin-dts";
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, './src/SchemaForm.tsx'),
      name: '@i-vresse/wb-tailwind-form',
      fileName: 'SchemaForm',
      formats: ['es']
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      // external: (id) => {
      //   const isExternal = !(id.startsWith('./') || id.startsWith('src/') )
      //   if (!isExternal) {
      //   console.log(id, isExternal)
      //   }

      //   return false
      //   return isExternal
      // }
      external: [
        'ajv-errors',
        'ajv',
        'ajv/dist/2020',
        'ajv-formats/dist/formats',
        'react-hook-form',
        '@hookform/resolvers/ajv',
        /^@radix-ui/,
        'lucide-react',
        'react',
        'class-variance-authority',
        'json-schema',
        'tailwind-merge',
        'clsx'
      ],
    },
  },
  plugins: [react(), dts()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
