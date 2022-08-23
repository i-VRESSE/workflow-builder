import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    coverage: {
      reporter: ['lcov', 'text'],
      all: true,
      src: ['src'],
      exclude: ['**/*.stories.tsx', '**/*.test.ts{,x}']
    },
  },
})