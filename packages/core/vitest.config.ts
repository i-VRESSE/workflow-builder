import { defineConfig } from 'vitest/config'


export default defineConfig({
  test: {
    coverage: {
      reporter: ['lcov', 'text'],
      all: true,
      src: ['src'],
      exclude: ['**/*.stories.tsx', '**/*.test.ts{,x}']
    },
  },
})