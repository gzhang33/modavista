# Fashion Factory Display System

时尚工厂产品展示系统，专为服装工厂向客户展示产品系列而设计。系统专注于优雅的产品展示和客户互动，而非直接电商功能。

## 📋 目录

- [项目总结](#-项目总结)
- [项目技术栈](#-项目技术栈)
- [快速开始](#-快速开始)
- [配置说明](#-配置说明)
- [许可证](#-许可证)

## 🎯 项目总结

这个系统是服装批发工厂的数字产品目录，主要用途：
- 向潜在客户展示服装系列
- 支持桌面和手机设备浏览
- 方便客户联系我们
- 提供实时产品管理功能
- 通过数据分析跟踪客户互动


## 🛠️ 项目技术栈

### 前端技术
- **React 18.3.1**: 现代化用户界面框架
- **TypeScript 5.6.3**: 类型安全的JavaScript开发
- **Vite 5.4.19**: 极速开发构建工具
- **Tailwind CSS 3.4.17**: 原子化CSS框架
- **Radix UI**: 无障碍UI组件库
- **React Query**: 强大的数据获取与状态管理
- **Framer Motion**: 流畅的动画库
- **Wouter**: 轻量级路由管理

### 后端技术
- **PHP 8.3.16**: 服务器端API逻辑
- **MySQL**: 数据库存储
- **mysqli**: 数据库连接，使用预处理语句防SQL注入
- **Drizzle ORM**: TypeScript优先的ORM工具

### 开发工具
- **Node.js 22.18.0**: 开发环境运行时
- **ESLint & TypeScript**: 代码质量保证
- **PostCSS**: CSS后处理器
- **Git**: 版本控制


## 🚀 快速开始

### 系统要求
- Node.js 18+
- PHP 8.3+
- MySQL 5.7+
- npm/yarn/pnpm

### 安装与运行

1. **克隆项目**
   ```bash
   cd e:\laragon\www
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **启动开发服务器**
   ```bash
   npm run dev
   ```

4. **构建生产版本**
   ```bash
   npm run build
   ```

### 项目脚本
- `npm run dev` - 启动Vite开发服务器
- `npm run build` - 构建生产版本
- `npm run preview` - 预览生产构建
- `npm run check` - TypeScript类型检查

## ⚙️ 配置说明

### 环境配置
- **开发环境**: Vite开发服务器 (通常运行在 http://localhost:5173)
- **API代理**: `/api` 路径代理到本地PHP服务器
- **静态资源**: 图片等资源存放在 `client/public` 目录

### 数据库配置
请参考 `database_guide.md` 文件了解数据库设置详情。

### 部署配置
详细部署指南请查看：
- `DEPLOYMENT_GUIDE.md` - 完整部署说明
- `deployment/` 目录 - 分阶段部署文档

## 📄 许可证

本项目专为DreaModa商业使用而设计。
