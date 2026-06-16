import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

const ROOT_MODULES = resolve('../node_modules')

export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || '/',
  server: {
    host: '0.0.0.0',
    port: 5000,
    allowedHosts: true,
  },
  resolve: {
    alias: {
      'react': `${ROOT_MODULES}/react`,
      'react-dom': `${ROOT_MODULES}/react-dom`,
      'react/jsx-runtime': `${ROOT_MODULES}/react/jsx-runtime`,
      'react/jsx-dev-runtime': `${ROOT_MODULES}/react/jsx-dev-runtime`,
    },
    dedupe: ['react', 'react-dom'],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    server: {
      deps: {
        inline: ['framer-motion'],
      },
    },
  },
})
