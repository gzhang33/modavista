import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  // 允许通过环境变量控制部署基础路径，GitHub Pages（项目页）通常为 '/<repo>/'
  base: process.env.VITE_BASE || '/',
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@shared": path.resolve(__dirname, "../shared"),
    },
    extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json"],
  },
  root: __dirname,
  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,
    sourcemap: false, // 生产环境不生成sourcemap
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-toast'],
          query: ['@tanstack/react-query']
        },
        // 确保文件名包含hash以便缓存
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  },
  server: {
    port: 5173, // 固定的开发端口，用于支持Playwright测试
    host: true, // 允许外部访问
    proxy: {
      '/api': {
        target: 'http://localhost',
        changeOrigin: true,
        secure: false
      },
      '/storage/uploads': {
        target: 'http://localhost',
        changeOrigin: true,
        secure: false
      },
      
    },
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
  publicDir: path.resolve(__dirname, "public"),
});