import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'], // Use ESM for inquirer compatibility
  dts: true, // Enable TypeScript declarations
  splitting: false,
  sourcemap: true,
  clean: true,
  shims: true,
  banner: {
    js: '#!/usr/bin/env node'
  },
  target: 'node16',
  outDir: 'dist'
})