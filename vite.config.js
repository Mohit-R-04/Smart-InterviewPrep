import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: '/', // Root path for Netlify (use '/Smart-InterviewPrep/' for GitHub Pages)
  server: {
    allowedHosts: ["quiet-stone-1cec.tunnl.gg"],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    css: false,
  },
}))
