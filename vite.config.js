import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 本地开发：Vite 提供 React 页面，/api 代理到 Express 后端（3000 端口）
// 生产构建：输出 dist/，由 Express 或 Vercel 托管
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3000'
    }
  },
  build: {
    outDir: 'dist'
  }
});
