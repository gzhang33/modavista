import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-toast'],
        }
      }
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost',
        changeOrigin: true,
        secure: false
      },
      // 产品图片代理到根目录的images文件夹
      '/product-images': {
        target: 'http://localhost/images',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/product-images/, '')
      }
    },
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
  publicDir: path.resolve(__dirname, "client", "public"),
});