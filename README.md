# Dreamoda E-commerce Platform

B2B产品展示平台，专为服装工厂设计。采用前后端分离架构，支持产品变体、多语言界面和后台管理。

## 项目架构

本项目采用前后端分离架构，实现关注点分离和模块化设计：

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   前端应用      │    │   后端服务      │    │   共享资源      │
│  (React + Vite) │◄──►│   (PHP + API)   │◄──►│   (Schemas)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

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
- React 18.2.0 + TypeScript 4.9.3
- Vite 4.1.0 + Tailwind CSS 3.2.7
- Radix UI (40+ 组件)
- TanStack React Query 4.24.6
- Wouter 3.7.1 + React Hook Form 7.62.0
- Zod 3.25.76 (表单验证)

### 后端
- PHP 8.0+ + MySQL 8.0+
- MySQLi (预处理语句防SQL注入)
- RESTful API
- 环境适配器 (开发/生产环境自动切换)

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
npm run dev              # 启动前端开发服务器
npm run build            # 构建前端
npm run preview          # 预览生产构建
npm run install:all      # 安装所有依赖

# 前端开发命令
cd frontend
npm run dev              # 开发模式
npm run build            # 生产构建
npm run preview          # 预览构建
npm run check            # TypeScript检查
```

## 开发规范

### 命名规范
- **目录/文件名**: 小写+下划线 (snake_case)
- **React组件**: 大驼峰 (PascalCase)
- **CSS类名**: BEM命名法

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
- **图片资源**: `/storage/uploads/product_images/` 路径

### 环境切换机制
- 自动环境检测：基于HTTP_HOST判断开发/生产环境
- 统一配置管理：通过.env文件和配置适配器实现
- 无缝切换：同一套代码适配两种环境，无需手动修改

### 数据库配置
1. 开发环境：配置本地MySQL数据库
2. 生产环境：配置Hostinger数据库信息
3. 配置文件：`backend/config/app.php` (统一管理)
4. 环境变量：`.env` 文件 (敏感信息)

## 相关文档

- [架构设计文档](docs/architecture.md)
- [API接口规范](docs/api_specification.md)
- [配置管理指南](docs/CONFIGURATION_GUIDE.md)
- [环境管理文档](docs/ENVIRONMENT_MANAGEMENT.md)
- [安全配置指南](docs/SECURITY_CONFIGURATION.md)
- [部署指南](docs/DEPLOYMENT_GUIDE.md)

## 许可证

本项目专为Dreamoda商业使用而设计。