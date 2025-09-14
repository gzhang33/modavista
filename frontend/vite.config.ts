import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
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
    port: 5173, // 固定的开发端口，用于支持Playwright测试
    host: true, // 允许外部访问
    proxy: {
      '/api': {
        target: 'http://localhost',
        changeOrigin: true,
        secure: false
      },
      // 产品图片代理配置 - 仅代理上传的图片（以media-开头的文件）
      '/product_images/media-': {
        target: 'http://localhost',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/product_images/, '/storage/uploads/product_images')
      },
      // 兼容旧的连字符格式，也仅代理上传的图片
      '/product-images/media-': {
        target: 'http://localhost',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/product-images/, '/storage/uploads/product_images')
      }
    },
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
  publicDir: path.resolve(__dirname, "public"),
});