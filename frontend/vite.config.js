import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8082',
        changeOrigin: true
      },
      '/login': {
        target: 'http://localhost:8082',
        changeOrigin: true
      },
      '/logout': {
        target: 'http://localhost:8082',
        changeOrigin: true
      },
      '/current-user': {
        target: 'http://localhost:8082',
        changeOrigin: true
      }
    }
  }
})
