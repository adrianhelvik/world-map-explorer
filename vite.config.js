import solidPlugin from 'vite-plugin-solid'
import babelPlugin from 'vite-plugin-babel'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [solidPlugin()],
})
