import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  // Relative base: the build works from any sub-path (e.g. GitHub Pages /rika-nodejs/).
  base: './',
  plugins: [react(), tailwindcss()],
})
