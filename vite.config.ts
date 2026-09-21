import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/* GitHub Pages serves the site from /<repository>/, and the deploy workflow
   passes that path in. It is empty for a site on its own domain, and never
   carries a trailing slash, which Vite wants. */
const basePath = process.env.BASE_PATH || '/'

// https://vite.dev/config/
export default defineConfig({
  base: basePath.endsWith('/') ? basePath : `${basePath}/`,
  plugins: [react()],
})
