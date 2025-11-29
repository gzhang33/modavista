<h1 align="center">Dreamoda B2B Showcase Platform</h1>

<p align="center"><a href="README.md">English</a> | <a href="README_cn.md">中文</a></p>

面向服装工厂的 B2B 产品展示与询价平台。支持多语言产品目录、响应式前台体验，以及模块化的后台管理工具（产品、媒体、翻译、询价、用户与安全）。本项目当前仅作展示用途，本文档聚焦于功能概览与主要界面预览。

## 目录
- [产品成果速览](#产品成果速览)
- [系统架构](#系统架构)
- [核心功能](#核心功能)
- [界面展示](#界面展示)
- [目录结构](#目录结构)
- [管理后台模块](#管理后台模块)
- [API 端点概览](#api-端点概览)
- [相关文档](#相关文档)
- [许可证](#许可证)

## 产品成果速览
- **前台商城**：React + TypeScript 打造的 SPU/SKU 产品目录，支持颜色变体、相关产品与智能筛选。
-$
- **后台控制台**：PHP 8 模块化管理后台，覆盖产品、基础数据、媒体、询价、翻译、用户权限与日志。
- **国际化体验**：内置 6 种语言，统一的多语言常量、类型和验证方案，集成 Microsoft Translator 自动翻译与翻译日志。
- **安全链路**：Session 认证 + TOTP 2FA 后台登录，统一的安全助手与错误日志。
- **演示全链路**：覆盖前台浏览、询价提交、后台审核与多语言展示的完整体验。

## 系统架构
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   前端应用      │    │   后端服务      │    │   共享资源      │
│  (React + Vite) │◄──►│   (PHP + API)   │◄──►│ (Types & Schema)│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```
- **现代化前端**：React 18、TypeScript、Tailwind CSS、Radix UI 组件库、TanStack React Query、Wouter 路由。
- **模块化后端**：PHP 8 RESTful API，组件化后台界面与事件驱动交互，集中安全与数据库抽象层。
- **共享层**：统一的 TypeScript 类型、Zod 校验、多语言常量与数据库 schema，前后端共用。

## 核心功能
### 前端（React + TypeScript）
- SPU/SKU 产品目录：按颜色变体展示产品，提供相关产品推荐与详情页图片画廊。
- 高级筛选与搜索：按分类、材质、颜色、季节、多语言关键字搜索与排序，支持网格/列表切换和分页骨架屏。
- 营销首页与落地页：Hero 横幅、品牌故事、定制服务模块、合作伙伴与客户评价。
- 联系与询价：多语言联系/询价表单，React Hook Form + Zod 前端实时校验与提交反馈。
- 多语言与 SEO：中/英/德/法/意/西 6 语种切换，SEO 元信息、结构化数据、图片懒加载与移动端适配。

### 后台（PHP Admin）
- 产品管理：SPU/SKU 创建与编辑、媒体上传与排序、状态管理与多语言字段编辑。
- 基础数据维护：分类、颜色、材质、季节等基础数据的多语言创建与编辑，带语言切换与创建状态提示。
- 客户询价与联系：联系/询价消息列表，支持时间与状态过滤、备注记录与移动端友好布局。
- 多语言翻译：翻译列表视图、按产品逐条编辑、多语言分页、未翻译筛选与翻译日志记录。
- 认证与安全：Session 登录、TOTP 双因素认证、会话检查与统一安全助手（输入清理、SQL 预处理）。

### API 与集成（PHP REST）
- 产品与基础数据：`/backend/api/products.php`、`/backend/api/categories.php`、`/backend/api/colors.php`、`/backend/api/materials.php`、`/backend/api/seasons.php`。
- 多语言与配置：`/backend/api/translation.php`、`/backend/api/language.php`、`/backend/api/config.php`。
- 媒体与联系：`/backend/api/media.php`、`/backend/api/contact.php`、`/backend/api/contact_messages.php`、`/backend/api/inquiries.php`。
- 管理与安全：`/backend/api/admin/*.php`（基础数据与翻译日志），`/backend/api/login.php`、`/backend/api/logout.php`、`/backend/api/check_session.php`、`/backend/api/verify_2fa.php`。

### 共享层与运维
- 统一类型与常量：前后端共用的 `shared/types`、`shared/constants` 与 `shared/database/schema.ts`。
- 工具与翻译网关：`shared/utils` 与 `backend/lib/translation_gateway.php`，统一翻译与错误消息结构。
- 日志与监控：`translation_logs` 表记录自动/手动翻译，`storage/logs/php_errors.log` 记录运行时错误。
- 部署脚本：`scripts/deploy.bat` 提供构建、同步与健康检查的部署流程。

## 界面展示

### 前端界面
| 场景（线上地址） | 预览 | 亮点与文案 |
| --- | --- | --- |
| [首页](https://dreamoda.store/en/#hero) | ![首页概览](storage/readme/frontend-home.png) | Hero 横幅、分类轮播、精选产品组件、品牌故事、定制服务、合作伙伴与客户评价，并内置联系表单锚点 |
| [首页分类焦点](https://dreamoda.store/en/#category) | ![首页分类](storage/readme/frontend-category.png) | Category Carousel 展示六大品类，支持滚动切换并一键跳转至对应筛选条件，强化大量 SKU 的可视化导航体验 |
| [系列与筛选页](https://dreamoda.store/en/collections) | ![系列筛选](storage/readme/frontend-collections.png) | React Query 拉取产品列表，支持多语言过滤（分类/材质/颜色/季节）、搜索、排序、网格/列表切换与分页骨架屏 |
| [产品详情](https://dreamoda.store/en/product/118) | ![产品详情](storage/readme/frontend-product-detail.png) | 图片画廊、材质/颜色/规格信息、相关产品模块与多语言 SEO 元信息 |
| [联系与询价表单](https://dreamoda.store/en/#contact) | ![联系表单](storage/readme/frontend-contact.png) | React Hook Form + Zod 实时校验、提交后 Toast 提示、Google 地图链接与多语言提示文案 |
| [合作伙伴与评价](https://dreamoda.store/en/#partners) | ![合作伙伴与评价](storage/readme/frontend-partners.png) | 动态滚动的合作伙伴国家旗帜与 Testimonials 轮播，展示欧洲 B2B 客户信任背书与真实反馈 |

### 后端界面
| 场景（线上地址） | 预览 | 亮点与文案 |
| --- | --- | --- |
| 产品仪表盘 | ![仪表盘](storage/readme/admin-dashboard.png) | 批量筛选/排序、勾选操作、快速跳转新增产品，支持多语言切换与状态批量管理 |
| 产品编辑 | ![产品表单](storage/readme/admin-product-form.png) | 表单校验、材质/颜色/季节等元数据选择、媒体上传与 Toast 提示，复用 `_form.php` 组件化表单 |
| 询价管理 | ![询价管理](storage/readme/admin-inquiries.png) | 询价列表与详情，支持时间/状态过滤、备注、排序与「No data」兜底提示 |
| 多语言翻译 | ![翻译管理](storage/readme/admin-translations.png) | 语言标签切换、分页、未翻译筛选、按产品逐条编辑翻译字段并支持分批保存 |

## 目录结构
```
Dreamoda/
├── frontend/        # React + Vite 前端
│   ├── src/         # 源码与 UI 组件
│   ├── public/      # 静态资源与多语言 JSON
│   └── *.config.ts  # 前端配置
├── backend/         # PHP 后端与后台管理
│   ├── api/         # RESTful API
│   ├── admin/       # 管理后台页面
│   └── config/      # 环境与数据库配置
├── shared/          # 类型、常量、工具与数据库 schema
├── docs/            # 技术文档与架构说明
├── scripts/         # 部署与工具脚本
├── storage/         # 媒体资源、上传文件与日志
└── package.json     # 根目录脚本与依赖
```

## 管理后台模块
- **产品管理** (`/backend/admin/dashboard.php`): 列表、筛选、排序、批量操作，以及跳转到新增/编辑产品。
- **产品新增/编辑** (`/backend/admin/add_product.php`、`/backend/admin/edit_product.php`): 结构化表单、媒体上传、材质/颜色/季节元数据管理与多语言标签。
- **基础数据维护** (`/backend/admin/data-editing.php`): 颜色、材质、季节等基础数据的多语言创建与编辑，带语言选择与创建状态提示。
- **客户询价** (`/backend/admin/contact_messages.php`): 询价/联系消息列表、状态标记、备注与移动端友好视图。
- **多语言翻译** (`/backend/admin/translations.php`): 语言切换、分页、空值筛选与逐条翻译编辑，并与翻译日志联动。
- **用户认证** (`/backend/admin/login.html`): 登录表单 + 会话校验，配合 `/backend/api/verify_2fa.php` 进行二次验证。
- **技术架构**: 组件化 JS、事件驱动（EventBus）、响应式 UI、Toast 通知、前后端双重验证。

## API 端点概览
- **产品与基础数据**：`/backend/api/products.php`、`/backend/api/categories.php`、`/backend/api/colors.php`、`/backend/api/materials.php`、`/backend/api/seasons.php`
- **多语言与配置**：`/backend/api/translation.php`、`/backend/api/language.php`、`/backend/api/config.php`
- **媒体与联系**：`/backend/api/media.php`、`/backend/api/contact.php`、`/backend/api/contact_messages.php`、`/backend/api/inquiries.php`
- **管理与安全**：`/backend/api/admin/*.php`、`/backend/api/login.php`、`/backend/api/logout.php`、`/backend/api/check_session.php`、`/backend/api/verify_2fa.php`

## 相关文档
- [架构设计](architecture_cn.md)
- [API 规范](api_specification_cn.md)

## 许可证
本项目专为 Dreamoda 商业使用而设计。
