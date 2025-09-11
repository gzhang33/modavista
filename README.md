# DreaModa Fashion Factory Display System

> **📢 更新说明**: 项目已完成大规模代码清理，移除了测试文件、过时代码和冗余内容，提升了代码库的可维护性。

时尚工厂产品展示系统，专为服装工厂向客户展示产品系列而设计。系统专注于优雅的产品展示和客户互动，支持产品变体展示、多语言界面和管理后台。

## 📋 目录

- [项目总结](#-项目总结)
- [核心功能](#-核心功能)
- [项目技术栈](#-项目技术栈)
- [快速开始](#-快速开始)
- [配置说明](#-配置说明)
- [项目结构](#-项目结构)
- [许可证](#-许可证)

## 🎯 项目总结

DreaModa是专为服装批发工厂设计的现代化B2B产品展示平台，采用前后端分离架构，支持产品变体、多语言界面和完整的后台管理功能。

## ✨ 核心功能

### 🛍️ 前端展示功能
- **产品展示**: 支持产品变体（同款不同颜色/材质）
- **智能筛选**: 按分类、材质、风格、季节等多维度筛选
- **响应式设计**: 完美适配桌面和移动设备
- **多语言支持**: 内置国际化架构
- **图片优化**: 自动图片处理和懒加载

### 📋 客户互动功能
- **询价表单**: 完整的客户信息收集
- **产品咨询**: 针对特定产品的询价
- **联系方式**: 多渠道联系信息展示

### ⚙️ 管理后台功能
- **产品管理**: 完整的CRUD操作
- **媒体管理**: 图片上传和自动清理
- **询价管理**: 客户询价跟踪和处理
- **用户认证**: 安全的后台登录系统


## 🛠️ 项目技术栈

### 前端技术栈
- **React 18.3.1**: 现代化用户界面框架
- **TypeScript 5.6.3**: 类型安全的JavaScript开发
- **Vite 5.4.19**: 极速开发构建工具
- **Tailwind CSS 3.4.17**: 原子化CSS框架
- **Radix UI**: 无障碍UI组件库 (40+ 组件)
- **TanStack React Query 5.60.5**: 强大的数据获取与状态管理
- **Framer Motion 11.13.1**: 流畅的动画库
- **Wouter 3.3.5**: 轻量级路由管理
- **React Hook Form 7.55.0**: 高性能表单库
- **Zod 3.24.2**: TypeScript优先的模式验证

### 后端技术栈
- **PHP 8.3+**: 服务器端API逻辑
- **MySQL 5.7+**: 数据库存储
- **MySQLi**: 数据库连接，使用预处理语句防SQL注入
- **RESTful API**: 标准化的API设计

### 开发工具
- **Node.js 22.18.0**: 开发环境运行时
- **TypeScript 5.6.3**: 类型检查和编译
- **ESLint**: 代码质量保证
- **PostCSS 8.4.47**: CSS后处理器
- **Git**: 版本控制


## 🚀 快速开始

### 系统要求
- **Node.js**: 18.0+ (推荐 22.18.0)
- **PHP**: 8.3+
- **MySQL**: 5.7+
- **包管理器**: npm/yarn/pnpm

### 安装与运行

1. **克隆项目**
   ```bash
   cd e:\laragon\www
   ```

2. **安装前端依赖**
   ```bash
   npm install
   ```

3. **配置数据库**
   - 在 phpMyAdmin 中创建数据库
   - 导入数据库表结构 (参考 `PROJECT_STRUCTURE.md`)

4. **启动开发服务器**
   ```bash
   npm run dev
   ```
   前端将在 `http://localhost:5173` 启动 (固定端口，支持Playwright测试)

5. **构建生产版本**
   ```bash
   npm run build
   ```

### 项目脚本
- `npm run dev` - 启动Vite开发服务器
- `npm run build` - 构建生产版本 (输出到 `dist/`)
- `npm run preview` - 预览生产构建
- `npm run check` - TypeScript类型检查

## ⚙️ 配置说明

### 环境配置
- **前端开发**: `http://localhost:5173` (Vite开发服务器，固定端口用于Playwright测试)
- **API代理**: `/api` 路径自动代理到本地PHP服务器
- **图片代理**: `/product-images` 路径代理到PHP服务器
- **静态资源**: 存放在 `client/public/` 目录

### 数据库配置
1. 在 phpMyAdmin 中创建数据库
2. 参考 `PROJECT_STRUCTURE.md` 中的数据库表结构
3. 配置 `api/config.php` 中的数据库连接信息

### API配置
- **基础URL**: `/api/` (生产环境) 或 `http://localhost/api/` (开发环境)
- **响应格式**: 统一的JSON格式，包含 `success`, `data`, `message`, `timestamp`
- **认证**: 使用session-based认证

### 部署配置
详细部署指南请查看：
- `PROJECT_STRUCTURE.md` - 完整架构和部署说明
- `deploy/` 目录 - Hostinger部署相关文件

## 📁 项目结构

```
e:\laragon\www/
├── client/                    # React前端源码
│   ├── src/
│   │   ├── components/        # React组件
│   │   │   ├── ui/           # 基础UI组件 (Radix UI)
│   │   │   ├── header.tsx    # 头部导航
│   │   │   ├── footer.tsx    # 页脚
│   │   │   └── ...
│   │   ├── pages/            # 页面组件
│   │   ├── lib/              # 工具库
│   │   ├── hooks/            # 自定义Hooks
│   │   ├── types/            # TypeScript类型
│   │   └── App.tsx           # 主应用组件
│   ├── public/               # 静态资源
│   └── index.html            # HTML模板
├── api/                      # PHP后端API
│   ├── config.php           # 数据库配置
│   ├── products.php         # 产品API
│   ├── categories.php       # 分类API
│   ├── contact.php          # 联系表单API
│   └── utils.php            # 工具函数
├── admin/                    # 管理后台
│   ├── assets/              # 后台静态资源
│   ├── dashboard.php        # 主仪表盘
│   ├── add_product.php      # 添加产品
│   └── login.html           # 登录页面
├── shared/                   # 共享类型定义
│   ├── schema.ts            # Zod验证模式
│   └── mysql-schema.ts      # MySQL模式定义
├── deploy/                   # 部署相关文件
├── dist/                    # 构建输出 (生产环境)
├── package.json             # 项目依赖
└── README.md               # 项目说明
```

## 🤝 贡献指南

### 开发规范
1. **代码规范**: 遵循ESLint和TypeScript严格模式
2. **提交规范**: 使用清晰的commit message
3. **分支管理**: feature分支开发，PR合并到main
4. **测试**: 确保所有功能正常工作

### 主要贡献者
- 开发团队: DreaModa技术团队

## 🐛 问题反馈

如遇到问题，请查看：
- `PROJECT_STRUCTURE.md` - 详细的技术文档
- `QODER.md` - AI开发助手指南

## 📄 许可证

本项目专为DreaModa商业使用而设计。
