import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Update base to match your GitHub Pages repo name if needed.
export default defineConfig({
  plugins: [react()],
  base: '/',
})

