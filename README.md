# Dreamoda E-commerce Platform

B2B产品展示平台，专为服装工厂设计。采用前后端分离架构，支持产品变体、多语言界面和现代化后台管理系统。

## 项目架构

本项目采用前后端分离架构，实现关注点分离和模块化设计：

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   前端应用      │    │   后端服务      │    │   共享资源      │
│  (React + Vite) │◄──►│   (PHP + API)   │◄──►│   (Schemas)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 技术特点
- **现代化前端**: React 18 + TypeScript + Tailwind CSS + Radix UI
- **模块化后端**: PHP 8+ RESTful API + 组件化管理后台
- **智能管理**: 产品变体管理、多语言翻译、客户询价跟踪
- **响应式设计**: 完美适配桌面端和移动端

## 目录结构

```
dreamoda-project/
├── frontend/           # 前端应用 (React + Vite)
│   ├── src/           # 源代码
│   ├── public/        # 静态资源
│   ├── package.json   # 前端依赖
│   └── *.config.ts    # 前端配置文件
├── backend/           # 后端应用 (PHP)
│   ├── api/           # API接口
│   ├── admin/         # 管理后台
│   └── config/        # 配置文件
├── shared/            # 共享资源
│   └── schemas/       # 数据结构定义
├── docs/              # 项目文档
├── scripts/           # 工具脚本
├── storage/           # 存储目录 (不纳入Git)
└── package.json       # 项目级配置
```

## 核心功能

### 前端功能 (React + TypeScript)
- **产品展示**: 支持产品变体（同款不同颜色/材质）
- **智能筛选**: 按分类、材质、颜色、季节筛选
- **响应式设计**: 完美适配桌面和移动设备
- **多语言支持**: 内置国际化架构 (中文/英文/德文/法文/意大利文/西班牙文)
- **图片优化**: 自动图片处理和懒加载
- **SEO优化**: 结构化数据和元标签管理
- **性能优化**: 代码分割和图片懒加载

### 后台管理功能 (PHP + JavaScript)
- **产品管理**: 完整CRUD操作，支持产品变体管理
- **媒体管理**: 图片上传、自动清理和排序
- **客户询价管理**: 询价跟踪、状态管理和备注功能
- **多语言翻译**: AI驱动的自动翻译系统
- **用户认证**: 现代化安全登录系统
- **数据统计**: 产品数据和客户询价统计
- **移动端适配**: 响应式管理界面

## 技术栈

### 前端技术栈
- **核心框架**: React 18.2.0 + TypeScript 5.9.2
- **构建工具**: Vite 4.1.0 + ESLint
- **样式系统**: Tailwind CSS 3.2.7 + Tailwind Typography
- **UI组件库**: Radix UI (40+ 无障碍组件)
- **状态管理**: TanStack React Query 4.24.6
- **路由系统**: React Router DOM 6.8.1 + Wouter 3.7.1
- **表单处理**: React Hook Form 7.62.0 + Zod 3.25.76
- **图标系统**: Lucide React 0.263.1
- **动画效果**: Tailwind CSS Animate + Framer Motion
- **图表组件**: Recharts 2.5.0

### 后端技术栈
- **核心语言**: PHP 8.0+ + MySQL 8.0+
- **数据库**: MySQLi (预处理语句防SQL注入)
- **API架构**: RESTful API设计
- **环境管理**: 自动环境检测和配置适配
- **安全机制**: 会话管理和CSRF保护
- **文件处理**: 图片上传和媒体管理

## 快速开始

### 系统要求
- Node.js 18.0+
- PHP 8.0+
- MySQL 8.0+

### 安装步骤
```bash
# 1. 克隆项目
git clone <repository-url>
cd dreamoda-project

# 2. 安装依赖
npm run install:all

# 3. 配置数据库
# 在phpMyAdmin中创建数据库，导入表结构

# 4. 启动开发服务器
npm run dev
# 前端: http://localhost:5173
```

### 项目脚本
```bash
# 项目级命令
npm run dev              # 启动前端开发服务器 (http://localhost:5173)
npm run build            # 构建前端生产版本
npm run preview          # 预览生产构建
npm run install:all      # 安装所有依赖

# 前端开发命令
cd frontend
npm run dev              # 开发模式 (热重载)
npm run build            # 生产构建 (TypeScript编译 + Vite打包)
npm run preview          # 预览构建结果
npm run lint             # ESLint代码检查

# 后端开发
# 确保PHP服务器运行在根目录
# 访问 http://localhost/backend/admin/ 进入管理后台
```

## 开发规范

### 命名规范
- **目录/文件名**: 小写+下划线 (snake_case)
- **React组件**: 大驼峰 (PascalCase)
- **CSS类名**: BEM命名法 + Tailwind CSS
- **PHP文件**: snake_case.php
- **JavaScript模块**: camelCase.js

### Git工作流
1. 从 `develop` 分支创建功能分支
2. 开发完成后提交代码
3. 创建 Pull Request 合并到 `develop`
4. 测试通过后合并到 `main`

### 提交规范
```
type(scope): subject

feat(api): add user registration endpoint
fix(frontend): correct product image display
docs(readme): update installation guide
```

## 多环境开发

**本项目需基于同一个代码库开展本地开发与线上生产工作，生成的代码必须同时满足本地开发调试需求与线上生产环境运行要求。**

### 环境配置
- **开发环境**: 自动检测localhost，使用本地数据库配置
- **生产环境**: 自动检测生产域名，使用Hostinger生产配置
- **前端开发**: `http://localhost:5173`
- **后端API**: `/backend/api/` 路径
- **管理后台**: `/backend/admin/` 路径
- **图片资源**: `/storage/uploads/product_images/` 路径
- **静态资源**: `/frontend/dist/` 构建输出

### 环境切换机制
- 自动环境检测：基于HTTP_HOST判断开发/生产环境
- 统一配置管理：通过.env文件和配置适配器实现
- 无缝切换：同一套代码适配两种环境，无需手动修改

### 数据库配置
1. 开发环境：配置本地MySQL数据库
2. 生产环境：配置Hostinger数据库信息
3. 配置文件：`backend/config/app.php` (统一管理)
4. 环境变量：`.env` 文件 (敏感信息)

## 管理后台功能详解

### 核心管理模块
- **产品管理** (`/backend/admin/dashboard.php`)
  - 产品列表展示和筛选
  - 产品添加/编辑/删除
  - 产品变体管理（同款不同颜色）
  - 媒体文件上传和排序

- **客户询价管理** (`/backend/admin/contact_messages.php`)
  - 询价消息查看和回复
  - 状态跟踪（待定/进行中/完成）
  - 备注和标签管理
  - 移动端适配界面

- **多语言翻译** (`/backend/admin/translations.php`)
  - AI驱动的自动翻译
  - 手动翻译编辑
  - 翻译状态管理
  - 批量翻译处理

- **用户认证** (`/backend/admin/login.html`)
  - 现代化登录界面
  - 会话管理和安全验证
  - 自动登录状态检查

### 技术架构
- **组件化设计**: 模块化JavaScript组件
- **事件驱动**: EventBus事件系统
- **响应式UI**: 移动端优先设计
- **实时反馈**: Toast通知系统
- **数据验证**: 客户端和服务端双重验证

## API接口概览

### 核心API端点
- **产品管理**: `/backend/api/products.php`
- **分类管理**: `/backend/api/categories.php`
- **材质管理**: `/backend/api/materials.php`
- **颜色管理**: `/backend/api/colors.php`
- **季节管理**: `/backend/api/seasons.php`
- **媒体管理**: `/backend/api/media.php`
- **客户询价**: `/backend/api/contact_messages.php`
- **多语言**: `/backend/api/translation.php`
- **用户认证**: `/backend/api/login.php`
- **会话管理**: `/backend/api/check_session.php`

## 相关文档

- [架构设计文档](docs/architecture.md)
- [API接口规范](docs/api_specification.md)
- [CSP和Blob URL修复](docs/CSP_BLOB_URL_FIX.md)

## 许可证

本项目专为Dreamoda商业使用而设计。