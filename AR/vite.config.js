import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    host: true,
    port: 5174,
    allowedHosts: [
      '.ngrok-free.app',
      '.ngrok-free.dev',
      '.ngrok.io',
      'localhost'
    ]
  }
})