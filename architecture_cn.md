# Dreamoda 架构文档

## 执行摘要

Dreamoda 采用前后端分离架构，前端使用 React 18 + TypeScript + Vite，后端使用 PHP 8+ RESTful API + MariaDB 11.8.3。架构设计聚焦于产品展示场景，采用 SPU/SKU 产品模型，支持多语言内容和自动翻译功能。所有技术决策已明确，确保 AI 代理在实施过程中保持一致性。

## 项目初始化

本项目为 brownfield 项目，技术栈已确定。无需使用 starter template。

**已建立的技术栈：**
- 前端：React 18.2.0 + TypeScript 5.9.2 + Vite 4.1.0
- 后端：PHP 8.0+ + MariaDB 11.8.3
- 构建工具：Vite（前端）、Composer（后端）

## 决策摘要表

| 类别 | 决策 | 版本 | 影响的 Epic | 理由 |
| ----- | ----- | ---- | ----------- | ---- |
| 前端框架 | React | 18.2.0 | 所有前端 Epic | 行业标准，组件化架构，生态丰富 |
| 编程语言 | TypeScript | 5.9.2 | 所有前端 Epic | 类型安全，更好的开发体验 |
| 构建工具 | Vite | 4.1.0 | 所有前端 Epic | 快速 HMR，优化的生产构建 |
| 样式方案 | Tailwind CSS | 3.2.7 | 所有前端 Epic | 工具优先 CSS，快速 UI 开发 |
| UI 组件库 | Radix UI | Latest | 所有前端 Epic | 无障碍组件，无样式设计 |
| 状态管理 | TanStack React Query | 4.24.6 | 所有前端 Epic | 服务器状态管理，缓存支持 |
| 路由系统 | Wouter | 3.7.1 | 所有前端 Epic | 轻量级路由解决方案 |
| 表单处理 | React Hook Form + Zod | 7.62.0 / 3.25.76 | 表单相关 Epic | 表单验证和类型安全 |
| HTTP 客户端 | Axios | 1.3.4 | 所有前端 Epic | API 通信 |
| 图标库 | Lucide React | 0.263.1 | 所有前端 Epic | 现代图标库 |
| 后端语言 | PHP | 8.0+ | 所有后端 Epic | 服务器端脚本，广泛的主机支持 |
| 数据库 | MariaDB | 11.8.3 | 所有后端 Epic | 关系型数据库，MySQL 兼容 |
| API 风格 | RESTful | - | 所有后端 Epic | 标准 HTTP 方法，JSON 响应 |
| 认证方式 | Session-based + 2FA | - | 认证 Epic | 安全的 TOTP 双因素认证 |
| 测试框架 | PHPUnit | 9.0 | 测试 Epic | 单元和集成测试 |
| 依赖管理 | Composer | Latest | 所有后端 Epic | PHP 包管理 |
| 2FA 库 | Google2FA | 9.0 | 认证 Epic | TOTP 认证 |
| QR 码生成 | Bacon QR Code | 3.0 | 认证 Epic | 2FA QR 码生成 |
| 翻译服务 | Microsoft Translator API | Latest | 多语言 Epic | 自动翻译功能 |

## 项目结构

```
dreamoda-project/
├── frontend/                    # 前端应用 (React + Vite)
│   ├── src/
│   │   ├── components/          # 可复用组件
│   │   │   ├── ui/              # Radix UI 组件库封装
│   │   │   ├── header.tsx
│   │   │   ├── header-simple.tsx
│   │   │   ├── footer.tsx
│   │   │   ├── product-modal.tsx
│   │   │   ├── contact-section.tsx
│   │   │   └── ...
│   │   ├── pages/               # 路由页面
│   │   │   ├── home.tsx
│   │   │   ├── collections.tsx
│   │   │   ├── product-detail.tsx
│   │   │   └── not-found.tsx
│   │   ├── contexts/            # React contexts
│   │   ├── hooks/               # 自定义 hooks
│   │   ├── lib/                 # 工具函数（如 React Query 客户端）
│   │   ├── types/               # 前端类型定义
│   │   ├── utils/               # 辅助函数
│   │   ├── App.tsx              # 主应用
│   │   └── main.tsx             # 入口点
│   ├── public/                  # 静态资源
│   │   └── locales/             # 翻译文件
│   ├── dist/                    # 构建输出
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   └── tsconfig.json
├── backend/                     # 后端应用 (PHP)
│   ├── api/                     # API 接口
│   │   ├── products.php
│   │   ├── categories.php
│   │   ├── colors.php
│   │   ├── materials.php
│   │   ├── seasons.php
│   │   ├── media.php
│   │   ├── contact.php
│   │   ├── contact_messages.php
│   │   ├── inquiries.php
│   │   ├── language.php
│   │   ├── translation.php
│   │   ├── image_manager.php
│   │   ├── error_messages.php
│   │   ├── utils.php
│   │   ├── config.php
│   │   ├── login.php
│   │   ├── logout.php
│   │   ├── check_session.php
│   │   ├── verify_2fa.php
│   │   ├── adapter.php
│   │   └── admin/                # 管理端 API
│   │       ├── categories.php
│   │       ├── colors.php
│   │       ├── materials.php
│   │       └── translation_logs.php
│   ├── admin/                   # 管理后台
│   │   ├── dashboard.php
│   │   ├── add_product.php
│   │   ├── edit_product.php
│   │   ├── data-editing.php
│   │   ├── filters_mobile.php
│   │   ├── contact_messages.php
│   │   ├── translations.php
│   │   ├── login.php
│   │   ├── login.html
│   │   ├── controllers/
│   │   ├── views/
│   │   ├── services/
│   │   ├── nav_helper.php
│   │   ├── assets_helper.php
│   │   ├── lib/
│   │   └── assets/               # 管理后台资源
│   │       ├── css/
│   │       └── js/
│   ├── lib/                      # 核心库
│   │   ├── Database.php
│   │   ├── DatabaseException.php
│   │   ├── DatabaseQueryHelper.php
│   │   ├── DatabaseCompatibility.php
│   │   ├── SecurityHelper.php
│   │   ├── EmailService.php
│   │   ├── WhatsAppService.php
│   │   ├── translation_gateway.php
│   │   └── TranslationHelper.php
│   ├── services/                 # 服务层
│   │   ├── data_editing/
│   │   └── logging/
│   ├── config/                   # 配置文件
│   │   ├── app.php
│   │   ├── env_loader.php
│   │   └── environment_adapter.php
│   ├── scripts/                  # 后端脚本（迁移、2FA）
│   │   ├── migration_2025_01_15_admin_translations.sql
│   │   ├── migration_2025_11_08_add_translation_logs.sql
│   │   └── setup_2fa.php
│   ├── composer.json
│   └── vendor/                   # Composer 依赖
├── shared/                       # 共享资源
│   ├── types/                    # TypeScript 类型定义
│   │   ├── api.ts
│   │   ├── frontend.ts
│   │   ├── options.ts
│   │   └── index.ts
│   ├── constants/                # 共享常量
│   │   ├── language.ts
│   │   ├── data_editing_messages.ts
│   │   └── index.ts
│   ├── utils/                    # 共享工具函数
│   │   ├── translation.ts
│   │   └── index.ts
│   └── database/                 # 数据库 Schema
│       └── schema.ts
├── docs/                         # 项目文档
├── scripts/                      # 工具脚本
│   ├── deploy.bat
│   └── setup_mariadb_admin.bat
└── storage/                      # 存储目录
    ├── logs/
    └── uploads/
        ├── product_images/
        ├── categories/
        ├── flags/
        └── 其他上传文件
```

## Epic 到架构映射

| Epic | 架构组件 | 位置 |
| ---- | -------- | ---- |
| Epic 1: 产品管理核心功能（SPU/SKU 模型） | 后端 API、数据库 Schema | `backend/api/products.php`, `shared/database/schema.ts` |
| Epic 2: 多语言支持系统 | 翻译服务、i18n 表结构 | `backend/lib/translation_gateway.php`, `*_i18n` 表 |
| Epic 3: 前端产品展示 | React 组件、API 集成 | `frontend/src/pages/collections.tsx`, `frontend/src/pages/product-detail.tsx` |
| Epic 4: 管理后台界面 | PHP 管理页面、JavaScript 交互 | `backend/admin/`, `backend/admin/assets/js/` |
| Epic 5: 用户认证和安全 | 认证端点、安全库 | `backend/api/login.php`, `backend/lib/SecurityHelper.php` |
| Epic 6: 媒体管理 | 图片管理 API | `backend/api/media.php`, `backend/api/image_manager.php` |
| Epic 7: 客户联系功能 | 联系表单 API | `backend/api/contact.php`, `backend/admin/contact_messages.php` |

## 技术栈详情

### 核心技术

**前端技术栈：**
- React 18.2.0：UI 框架
- TypeScript 5.9.2：类型系统
- Vite 4.1.0：构建工具
- Tailwind CSS 3.2.7：样式框架
- Radix UI：无障碍 UI 组件库
- TanStack React Query 4.24.6：服务器状态管理
- Wouter 3.7.1：路由系统
- React Hook Form 7.62.0 + Zod 3.25.76：表单处理
- Axios 1.3.4：HTTP 客户端

**后端技术栈：**
- PHP 8.0+：服务器端语言
- MariaDB 11.8.3：关系型数据库
- Composer：依赖管理
- PHPUnit 9.0：测试框架
- Google2FA 9.0：双因素认证
- Bacon QR Code 3.0：QR 码生成

### 集成点

**前端 ↔ 后端：**
- API 通信：RESTful JSON API
- 代理配置：Vite 代理 `/api` → `/backend/api`
- 认证：Session-based（管理操作）
- CORS：已启用

**后端 ↔ 数据库：**
- 连接：通过 `Database.php` 抽象层
- Schema 参考：`shared/database/schema.ts`
- 迁移：SQL 文件在 `scripts/` 目录

**外部服务：**
- Microsoft Translator API：自动翻译
- 邮件服务：联系表单通知（如配置）

## 实现模式

这些模式确保所有 AI 代理编写兼容的代码，防止冲突：

### 命名模式

**API 路由命名：**
- 使用复数形式：`/api/products.php`, `/api/categories.php`
- 使用小写字母和下划线：`products.php`, `contact_messages.php`

**数据库表命名：**
- 使用小写字母和下划线：`spu`, `sku`, `spu_i18n`
- 关联表使用下划线连接：`spu_colors`, `spu_materials`

**数据库列命名：**
- 使用小写字母和下划线：`product_id`, `color_id`, `created_at`
- 外键格式：`{table}_id`（如 `product_id`, `category_id`）

**前端组件命名：**
- 组件文件：PascalCase（如 `ProductModal.tsx`, `HeaderSimple.tsx`）
- 组件函数：PascalCase（如 `export const ProductModal = () => {}`）

**前端文件命名：**
- 组件文件：PascalCase（`.tsx` 扩展名）
- 工具文件：kebab-case（如 `query-client.ts`）
- 类型文件：kebab-case（如 `index.ts`）

**PHP 文件命名：**
- 使用 snake_case：`database.php`, `security_helper.php`
- 类文件：PascalCase 类名，snake_case 文件名

### 结构模式

**测试文件位置：**
- 前端：`frontend/src/__tests__/`（与源文件同目录或集中）
- 后端：`backend/tests/`（镜像 API 域结构）

**组件组织：**
- 按功能组织：`components/`, `pages/`, `hooks/`
- UI 组件库：`components/ui/`（Radix UI 组件）

**共享工具位置：**
- 前端工具：`frontend/src/lib/`, `frontend/src/utils/`
- 后端工具：`backend/lib/`
- 共享代码：`shared/utils/`

### 格式模式

**API 响应格式：**
- 成功响应：
```json
{
  "success": true,
  "data": { ... },
  "pagination": { ... }  // 如适用
}
```
- 错误响应：
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误消息",
    "field": "field_name"  // 可选
  }
}
```

**错误格式：**
- 统一错误对象：`{ code, message, field? }`
- 错误代码：大写字母和下划线（如 `VALIDATION_ERROR`, `NOT_FOUND`）

**JSON 中的日期格式：**
- 使用 ISO 8601 字符串：`"2025-01-27T10:00:00Z"`
- 不使用时间戳

### 通信模式

**状态更新模式：**
- 使用 TanStack React Query 的 `useMutation` 进行状态更新
- 乐观更新：在成功响应前更新 UI

**事件命名约定：**
- 使用 camelCase：`onProductClick`, `onFilterChange`
- 事件处理器前缀：`handle` 或 `on`

### 生命周期模式

**加载状态处理：**
- 使用 React Query 的 `isLoading` 和 `isFetching`
- 显示骨架屏或加载指示器

**错误恢复模式：**
- 使用 React Query 的错误边界
- 显示用户友好的错误消息
- 提供重试机制

**重试实现：**
- React Query 自动重试（可配置）
- 失败操作提供手动重试按钮

### 位置模式

**API 路由结构：**
- 公共 API：`backend/api/{resource}.php`
- 管理 API：`backend/api/admin/{resource}.php`
- 认证端点：`backend/api/{action}.php`（如 `login.php`, `logout.php`）

**静态资源组织：**
- 产品图片：`storage/uploads/product_images/`
- 分类图片：`storage/uploads/categories/`
- 标志图片：`storage/uploads/flags/`

**配置文件位置：**
- 前端配置：`frontend/vite.config.ts`, `frontend/tailwind.config.ts`
- 后端配置：`backend/config/app.php`
- 环境配置：`.env`（Git 忽略）

### 一致性模式

**UI 日期格式：**
- 使用 `date-fns` 库格式化日期
- 格式：`YYYY-MM-DD` 或本地化格式

**日志格式：**
- 后端日志：时间戳 + 级别 + 消息
- 位置：`storage/logs/php_errors.log`

**用户面向错误：**
- 使用友好的中文错误消息
- 避免技术术语
- 提供操作建议

## 一致性规则

### 命名约定

**前端：**
- 组件：PascalCase（`ProductCard`, `HeaderSimple`）
- 函数：camelCase（`fetchProducts`, `handleSubmit`）
- 常量：UPPER_SNAKE_CASE（`API_BASE_URL`）
- 文件：PascalCase（组件），kebab-case（工具）

**后端：**
- 类：PascalCase（`Database`, `SecurityHelper`）
- 函数：snake_case（`get_connection`, `sanitize_input`）
- 文件：snake_case（`database.php`, `security_helper.php`）
- 命名空间：`Dreamoda\`

**数据库：**
- 表名：小写字母和下划线（`spu`, `sku`, `spu_i18n`）
- 列名：小写字母和下划线（`product_id`, `created_at`）
- 外键：`{table}_id` 格式

### 代码组织

**前端：**
- 组件按功能组织：`components/`, `pages/`, `hooks/`
- UI 组件库：`components/ui/`
- 共享工具：`lib/`, `utils/`

**后端：**
- API 端点：`api/` 目录
- 管理页面：`admin/` 目录
- 核心库：`lib/` 目录
- 服务层：`services/` 目录

**共享代码：**
- 类型定义：`shared/types/`
- 常量：`shared/constants/`
- 工具函数：`shared/utils/`
- 数据库 Schema：`shared/database/`

### 错误处理

**前端错误处理：**
- 使用 React Query 的错误边界
- 显示用户友好的错误消息
- 记录错误到控制台（开发环境）

**后端错误处理：**
- 使用异常层次结构（`DatabaseException`）
- 返回统一的 JSON 错误格式
- 记录错误到日志文件

### 日志策略

**后端日志：**
- 位置：`storage/logs/php_errors.log`
- 格式：时间戳 + 级别 + 消息
- 级别：Error, Warning, Notice

**翻译日志：**
- 表：`translation_logs`
- 记录：产品 ID、内容类型、源/目标语言、翻译内容、提供者、时间戳

## 数据架构

### 数据模型

**SPU/SKU 模型：**
- SPU（Standard Product Unit）：产品主表，存储基础信息
- SKU（Stock Keeping Unit）：产品变体表，按颜色区分
- 关系：一个 SPU 可以有多个 SKU（不同颜色）

**多语言架构：**
- 使用 `*_i18n` 表存储多语言内容
- 支持语言：zh, en, de, fr, it, es
- 表结构：`spu_i18n`, `category_i18n`, `color_i18n`, `material_i18n`, `seasons_i18n`

**关联表：**
- `spu_colors`：SPU 颜色关联（支持主色调/次色调）
- `spu_materials`：SPU 材质关联（支持多材质）
- `sku_media`：SKU 媒体关联（图片）

### 数据库 Schema

**参考文件：** `shared/database/schema.ts`

**核心表：**
- `spu`：产品主表
- `sku`：产品变体表
- `category`：分类表（支持层级）
- `color`：颜色表
- `material`：材质表
- `seasons`：季节表
- `contact_messages`：联系消息表
- `admin`：管理员表
- `translation_logs`：翻译日志表

**多语言表：**
- `spu_i18n`：产品多语言
- `category_i18n`：分类多语言
- `color_i18n`：颜色多语言
- `material_i18n`：材质多语言
- `seasons_i18n`：季节多语言

## API 合约

### RESTful API 设计

**HTTP 方法：**
- GET：读取操作（列表、详情）
- POST：创建操作
- PUT：更新操作
- DELETE：删除操作

### 核心端点（基于当前代码）

**产品端点：**
- `GET /api/products.php`：产品列表（支持筛选、分页）
- `GET /api/products.php?id={id}`：产品详情

> 当前代码库中暂未实现 `POST/PUT/DELETE /api/products.php` 写入接口，如需扩展管理能力，可在现有文件上增加认证校验后扩展 HTTP 方法。

**数据端点：**
- `GET /api/categories.php`：分类列表
- `GET /api/colors.php`：颜色列表
- `GET /api/materials.php`：材料列表
- `GET /api/seasons.php`：季节列表

**管理端点：**
- `POST /api/admin/categories.php`：创建分类（需认证）
- `POST /api/admin/colors.php`：创建颜色（需认证）
- `POST /api/admin/materials.php`：创建材料（需认证）
- `GET /api/admin/translation_logs.php`：翻译日志（需认证）

**认证端点：**
- `POST /api/login.php`：管理员登录
- `POST /api/logout.php`：登出
- `GET /api/check_session.php`：检查会话
- `POST /api/verify_2fa.php`：2FA 验证

**其他端点：**
- `POST /api/contact.php`：提交联系表单
- `GET /api/contact_messages.php`：获取联系表单消息（管理用途）
- `GET /api/inquiries.php`：获取询盘/合作意向数据
- `GET /api/media.php`：媒体文件管理
- `GET /api/image_manager.php`：图片管理辅助端点
- `GET /api/language.php`：语言偏好
- `GET /api/config.php`：前端配置

### 请求/响应格式

**请求格式：**
- Content-Type: `application/json`
- Body: JSON 对象

**响应格式：**
- 成功：`{ "success": true, "data": { ... } }`
- 错误：`{ "success": false, "error": { "code": "...", "message": "..." } }`

## 安全架构

### 认证和授权

**认证方式：**
- Session-based 认证（管理操作）
- 2FA 支持（TOTP，Google Authenticator 兼容）

**授权模型：**
- 单一管理员角色（当前 MVP）
- 所有管理操作需要认证
- 公共 API 端点（产品列表、详情）无需认证

### 安全防护

**输入验证：**
- 前端：Zod schema 验证
- 后端：PHP 验证和清理（`SecurityHelper`）

**SQL 注入防护：**
- 使用预处理语句（`Database.php`）
- 禁止直接拼接 SQL

**XSS 防护：**
- React 内置转义
- 输出转义（后端）

**CSRF 保护：**
- Session-based tokens（管理操作）

**密码安全：**
- Bcrypt 加密（成本因子 ≥ 10）
- 2FA 支持

## 性能考虑

### 前端性能

**优化策略：**
- 代码分割：按路由分割，减少初始包大小
- 图片懒加载：初始加载仅加载可见区域图片
- 图片优化：自动生成 WebP 格式，提供多种尺寸
- React Query 缓存：API 响应缓存

**性能目标：**
- 首屏加载时间 < 2 秒（3G 网络）
- 页面交互响应时间 < 100ms

### 后端性能

**优化策略：**
- 数据库查询优化：使用索引，避免 N+1 查询
- 缓存策略：静态资源缓存，API 响应缓存（适当场景）
- 连接复用：数据库连接池

**性能目标：**
- API 响应时间 < 500ms（95 百分位）

## 部署架构

### 环境配置

**开发环境：**
- 本地 Laragon 环境
- PHP 8.0+，MariaDB 11.8.3
- Vite 开发服务器（端口 5173）

**生产环境：**
- Hostinger 托管
- Apache/Nginx
- PHP 8.0+，MariaDB 11.8.3

### 部署流程

**部署脚本：** `scripts/deploy.bat`

**步骤：**
1. 构建前端（`npm run build`）
2. 创建备份
3. 同步文件
4. 健康检查

## 开发环境

### 先决条件

- Node.js 18.0+
- PHP 8.0+
- MariaDB 11.8.3
- Composer（PHP 依赖管理）

### 设置命令

```bash
# 前端设置
cd frontend
npm install
npm run dev

# 后端设置
cd backend
composer install

# 数据库设置
# 运行 SQL 迁移脚本（如需要）
```

## 架构决策记录 (ADRs)

### ADR-001: 前后端分离架构

**决策：** 采用前后端分离架构，前端使用 React SPA，后端使用 PHP RESTful API。

**理由：**
- 关注点分离，便于独立开发和部署
- 前端可以使用现代工具链（Vite, TypeScript）
- 后端可以专注于 API 和数据逻辑
- 支持未来扩展（移动应用、第三方集成）

**影响：** 所有 Epic 都需要考虑前后端集成点。

### ADR-002: SPU/SKU 产品模型

**决策：** 使用 SPU/SKU 模型，按颜色区分产品变体，不包含价格和尺码信息。

**理由：**
- 符合服装行业展示场景需求
- 简化产品管理（无需管理价格和尺码）
- 专注于产品展示本身

**影响：** 产品管理 Epic、前端展示 Epic。

### ADR-003: 多语言 i18n 表结构

**决策：** 使用独立的 `*_i18n` 表存储多语言内容，而非 JSON 字段。

**理由：**
- 便于查询和索引
- 支持独立更新各语言内容
- 符合关系型数据库最佳实践

**影响：** 多语言支持 Epic、数据模型设计。

### ADR-004: Microsoft Translator API 集成

**决策：** 使用 Microsoft Translator API 实现自动翻译功能。

**理由：**
- 支持 6 种目标语言
- API 稳定可靠
- 翻译质量满足产品展示需求

**影响：** 多语言支持 Epic、翻译日志功能。

### ADR-005: Session-based 认证 + 2FA

**决策：** 使用 Session-based 认证，支持 TOTP 2FA。

**理由：**
- 适合管理后台场景
- 2FA 提供额外安全层
- 实现简单，维护成本低

**影响：** 用户认证和安全 Epic。

### ADR-006: TanStack React Query 状态管理

**决策：** 使用 TanStack React Query 管理服务器状态，而非 Redux。

**理由：**
- 专为服务器状态设计
- 自动缓存和同步
- 减少样板代码
- 适合 RESTful API

**影响：** 所有前端 Epic。

### ADR-007: Radix UI 组件库

**决策：** 使用 Radix UI 作为 UI 组件库。

**理由：**
- 内置无障碍支持（WCAG 2.1 AA）
- 无样式设计，可自定义
- 组件丰富（40+ 组件）
- 类型安全（TypeScript）

**影响：** 所有前端 UI Epic。

### ADR-008: Wouter 路由系统

**决策：** 使用 Wouter 而非 React Router。

**理由：**
- 轻量级（无 bundle 大小开销）
- Hook-based API
- 适合 SPA 场景

**影响：** 前端路由相关 Epic。

### ADR-009: 共享代码目录结构

**决策：** 使用 `shared/` 目录存储前后端共享的类型定义和常量。

**理由：**
- 单一数据源，避免重复
- 类型安全（TypeScript）
- 便于维护和更新

**影响：** 所有 Epic（类型定义和常量使用）。

### ADR-010: MariaDB 11.8.3 数据库

**决策：** 使用 MariaDB 11.8.3 作为数据库。

**理由：**
- MySQL 兼容
- 性能优秀
- 开源免费
- 项目已有使用

**影响：** 所有数据相关 Epic。

---

_由 BMAD 决策架构工作流 v1.3.2 生成_  
_日期：2025-01-27_  
_用户：BMad_

