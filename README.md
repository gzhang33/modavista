---
title: DreaModa Fashion Factory Display System
version: 1.0.0
last_updated: 2025-09-12
type: project_documentation
---

# DreaModa Fashion Factory Display System

B2B产品展示平台，专为服装工厂设计。前后端分离架构，支持产品变体、多语言界面和后台管理。

## 核心功能

### 前端功能
- 产品展示：支持产品变体（同款不同颜色/材质）
- 智能筛选：按分类、材质、风格、季节筛选
- 响应式设计：适配桌面和移动设备
- 多语言支持：内置国际化架构
- 图片优化：自动图片处理和懒加载

### 后台功能
- 产品管理：完整CRUD操作
- 媒体管理：图片上传和自动清理
- 询价管理：客户询价跟踪处理
- 用户认证：安全后台登录系统

## 技术栈

### 前端
- React 18.3.1 + TypeScript 5.6.3
- Vite 5.4.19 + Tailwind CSS 3.4.17
- Radix UI (40+ 组件)
- TanStack React Query 5.60.5
- Framer Motion 11.13.1
- Wouter 3.3.5 + React Hook Form 7.55.0
- Zod 3.24.2

### 后端
- PHP 8.3+ + MySQL 5.7+
- MySQLi (预处理语句防SQL注入)
- RESTful API

### 开发工具
- Node.js 22.18.0
- ESLint + PostCSS 8.4.47
- Git

## 快速开始

### 系统要求
- Node.js 18.0+ (推荐 22.18.0)
- PHP 8.3+
- MySQL 5.7+

### 安装步骤
```bash
# 1. 安装依赖
npm install

# 2. 配置数据库
# 在phpMyAdmin中创建数据库，导入表结构

# 3. 启动开发服务器
npm run dev
# 前端: http://localhost:5173

# 4. 构建生产版本
npx vite build  # 推荐：跳过TypeScript检查
npm run build   # 完整构建（可能遇到警告）
```

### 项目脚本
- `npm run dev` - 启动Vite开发服务器
- `npm run build` - 构建生产版本
- `npm run preview` - 预览生产构建
- `npm run check` - TypeScript类型检查

## 配置说明

### 环境配置
- 前端开发：`http://localhost:5173`
- API代理：`/api` 路径自动代理到本地PHP服务器
- 图片代理：`/product-images` 路径代理到PHP服务器
- 静态资源：`client/public/` 目录

### 数据库配置
1. 在phpMyAdmin中创建数据库
2. 配置 `api/config.php` 中的数据库连接信息

### API配置
- 基础URL：`/api/` (生产) 或 `http://localhost/api/` (开发)
- 响应格式：统一JSON格式 (`success`, `data`, `message`, `timestamp`)
- 认证：session-based认证

## 项目结构

```
e:\laragon\www/
├── client/           # React前端源码
│   ├── src/
│   │   ├── components/  # React组件
│   │   ├── pages/       # 页面组件
│   │   ├── lib/         # 工具库
│   │   └── types/       # TypeScript类型
│   └── public/          # 静态资源
├── api/              # PHP后端API
│   ├── config.php    # 数据库配置
│   ├── products.php  # 产品API
│   └── utils.php     # 工具函数
├── admin/            # 管理后台
├── shared/           # 共享类型定义
├── deploy/           # 部署相关文件
└── dist/             # 构建输出
```

## 常见问题

### 构建问题
1. **TypeScript构建错误**
   - 问题：未使用的变量和导入导致构建失败
   - 解决：使用 `npx vite build` 跳过TypeScript检查

2. **CSS构建错误**
   - 问题：`border-border`、`bg-background` 等类不存在
   - 解决：替换为标准的Tailwind类名

3. **路径解析问题**
   - 问题：在client目录中运行构建时 `@/` 别名无法解析
   - 解决：从项目根目录运行构建命令

### 部署问题
1. **数据库导出失败**
   - 问题：mysqldump插件加载失败
   - 解决：使用phpMyAdmin手动导出

2. **打包脚本路径错误**
   - 问题：PowerShell脚本路径解析错误
   - 解决：从项目根目录运行打包脚本

## 相关文档

- `DEPLOYMENT_GUIDE.md` - 完整部署指南（包含Hostinger部署）
- `BUILD_ISSUES_SOLUTIONS.md` - 构建问题解决方案
- `TRANSLATION_SETUP.md` - 翻译功能配置指南

## 许可证

本项目专为DreaModa商业使用而设计。