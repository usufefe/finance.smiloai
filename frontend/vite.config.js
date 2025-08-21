import path from 'path';

import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default ({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  const proxy_url =
    process.env.VITE_DEV_REMOTE === 'remote'
      ? process.env.VITE_BACKEND_SERVER
      : 'http://localhost:8888/';

  const config = {
    plugins: [react()],
    resolve: {
      base: '/',
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    server: {
      port: 3001,
      proxy: {
        '/api': {
          target: proxy_url,
          changeOrigin: true,
          secure: false,
        },
      },
      headers: {
        // iframe için güvenlik ayarları
        'X-Frame-Options': 'SAMEORIGIN', // Sadece aynı origin'den iframe'e izin ver
        'Content-Security-Policy': "frame-ancestors 'self' https://console.smiloai.com https://smiloai.com http://localhost:8080 http://localhost:3001;",
      },
    },
  };
  return defineConfig(config);
};
