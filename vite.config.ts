import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    watch: {
      ignored: [
        '**/node_modules/**',
        '**/dist/**',
        '**/.git/**',
        '**/*.json',
        '**/*.sql',
        '**/*.config.*',
        '**/*.md'
      ]
    }
  },
  clearScreen: false
})
