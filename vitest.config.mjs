// vite.config.mjs
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['tests/setup/setupTests.js'], // crea este file si no existe
    css: true,
    globals: true,
    coverage: {
      provider: 'v8',
      reportsDirectory: 'coverage',      // salida estándar
      reporter: ['text', 'html', 'json', 'lcov'], // <- genera coverage-summary.json y lcov.info
      all: true,                         // contabiliza archivos sin tests
      lines: 95, branches: 90, functions: 95, statements: 95 // umbrales (ajusta si quieres)
    }
  }
})
