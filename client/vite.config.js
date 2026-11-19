// Vite build tool settings: enables React and forwards /api and /uploads to the backend during development.
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const backend = process.env.VITE_BACKEND_URL || env.VITE_BACKEND_URL || 'http://localhost:5000';
  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: { '/api': backend, '/uploads': backend },
    },
  };
});
