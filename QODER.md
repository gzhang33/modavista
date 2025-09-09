# QODER.md - AI开发助手指南

> 这是一个专门为AI代码助手设计的项目文档，提供完整的项目理解和开发指导。
> 最后更新：2025-09-08

## 📋 项目概览

### 项目名称
**DreaModa Fashion Factory Display System** - 时尚工厂产品展示系统

### 项目类型
现代化前后端分离的B2B产品展示平台，专为服装工厂向客户展示产品系列而设计。

### 核心业务
- 产品展示与浏览（支持产品变体：同产品不同颜色/材质）
- 客户询价管理（联系表单集成）
- 产品分类筛选（动态分类、材质、颜色过滤）
- 多语言支持（i18n国际化架构）
- 管理后台控制（产品CRUD、媒体管理）
- 图片媒体管理（本地上传、自动清理）

## 🏗️ 技术架构

### 架构模式
```
前端 (React/TypeScript) ←→ PHP API ←→ MySQL 数据库
                ↓
        管理后台 (PHP/原生JS)
```

### 技术栈详情

#### 前端技术栈
- **框架**: React 18.3.1 + TypeScript 5.6.3
- **构建工具**: Vite 5.4.19 (开发服务器 + 构建)
- **样式**: Tailwind CSS 3.4.17 (原子化CSS)
- **UI组件**: Radix UI (无障碍组件库)
- **状态管理**: React Query (@tanstack/react-query)
- **路由**: Wouter (轻量级路由)
- **动画**: Framer Motion
- **表单**: React Hook Form + Zod验证

#### 后端技术栈
- **语言**: PHP 8.3+ (主要API层)
- **数据库**: MySQL 5.7+
- **连接**: mysqli (预处理语句防SQL注入)
- **API风格**: RESTful JSON API

#### 开发环境
- **运行时**: Node.js 22.18.0 (仅开发构建)
- **包管理**: npm/pnpm
- **类型检查**: TypeScript严格模式
- **代码质量**: ESLint

## 📁 目录结构

```
e:\laragon\www/                           # 项目根目录
├── client/                               # React前端源码
│   ├── src/
│   │   ├── components/                   # 组件库
│   │   │   ├── ui/                      # 基础UI组件 (基于Radix UI)
│   │   │   │   ├── button.tsx           # 按钮组件
│   │   │   │   ├── dialog.tsx           # 对话框组件
│   │   │   │   ├── card.tsx             # 卡片组件
│   │   │   │   └── ...                  # 其他UI组件
│   │   │   ├── header.tsx               # 头部导航
│   │   │   ├── footer.tsx               # 页脚
│   │   │   ├── hero-section.tsx         # 首页横幅
│   │   │   ├── product-modal.tsx        # 产品弹窗
│   │   │   ├── category-carousel.tsx    # 分类轮播
│   │   │   ├── category-filter.tsx      # 分类筛选
│   │   │   ├── featured-collection.tsx  # 精选系列
│   │   │   ├── company-info.tsx         # 公司信息
│   │   │   └── contact-section.tsx      # 联系表单
│   │   ├── pages/                       # 页面组件
│   │   │   ├── home.tsx                 # 首页
│   │   │   ├── products.tsx             # 产品页
│   │   │   └── not-found.tsx            # 404页面
│   │   ├── hooks/                       # 自定义Hooks
│   │   │   ├── use-mobile.tsx           # 移动设备检测
│   │   │   └── use-toast.ts             # 消息提示
│   │   ├── lib/                         # 工具库
│   │   │   ├── queryClient.ts           # React Query配置
│   │   │   └── utils.ts                 # 工具函数
│   │   ├── types/                       # TypeScript类型
│   │   │   └── index.ts                 # 类型定义导出
│   │   ├── App.tsx                      # 应用根组件
│   │   ├── main.tsx                     # 应用入口
│   │   └── index.css                    # 全局样式
│   ├── public/                          # 静态资源
│   └── index.html                       # HTML模板
├── api/                                 # PHP后端API
│   ├── config.php                       # 数据库配置
│   ├── utils.php                        # 工具函数
│   ├── products.php                     # 产品API
│   ├── categories.php                   # 分类API
│   ├── colors.php                       # 颜色API
│   ├── materials.php                    # 材质API
│   ├── contact.php                      # 联系表单API
│   ├── login.php                        # 登录API
│   ├── logout.php                       # 登出API
│   └── check_session.php               # 会话检查
├── admin/                               # 管理后台
│   ├── assets/                          # 后台静态资源
│   │   ├── css/                        # 样式文件
│   │   └── js/                         # JavaScript文件
│   ├── login.html                       # 登录页面
│   ├── dashboard.php                    # 仪表盘
│   ├── add_product.php                  # 添加产品
│   └── edit_product.php                # 编辑产品
├── shared/                              # 共享类型定义
│   ├── schema.ts                        # Zod验证模式
│   └── mysql-schema.ts                  # MySQL模式定义
├── config/                              # 配置文件
│   └── hostinger_config.php            # Hostinger配置
├── package.json                         # 项目依赖
├── vite.config.ts                       # Vite配置
├── tailwind.config.ts                   # Tailwind配置
├── tsconfig.json                        # TypeScript配置
├── components.json                      # 组件库配置
├── README.md                            # 项目说明
├── PROJECT_STRUCTURE.md                 # 详细结构说明
└── QODER.md                            # AI开发指南(本文件)
```

## 🔧 开发配置

### 重要配置文件

#### package.json 脚本
```json
{
  "scripts": {
    "dev": "vite",                       # 启动开发服务器
    "build": "tsc && vite build",        # 构建生产版本
    "preview": "vite preview",           # 预览构建结果
    "check": "tsc --noEmit"             # TypeScript类型检查
  }
}
```

#### vite.config.ts
```typescript
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),  # 源码别名
      "@shared": path.resolve(__dirname, "shared"),   # 共享类型别名
    },
  },
  root: path.resolve(__dirname, "client"),           # 源码根目录
  build: {
    outDir: path.resolve(__dirname, "dist"),         # 构建输出
    emptyOutDir: true,
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',             # 开发环境API代理
        changeOrigin: true,
      }
    }
  }
});
```

## 📊 数据模型

### 核心类型定义 (shared/schema.ts)

```typescript
// 产品类型 - 严格类型检查
export interface Product {
  id: number | string;
  name: string;
  description: string;
  category: string;
  fabric: string;
  style: string;
  season: string;
  images: string[];                    # 必须为字符串数组
  featured: "yes" | "no";             # 严格类型限制
  specifications?: Record<string, any>;
  created_at?: string;
}

// 询价类型
export interface Inquiry {
  id?: number;
  first_name: string;
  last_name: string;
  email: string;
  company: string;
  business_type: string;
  message: string;
  product_id?: number;
  inquiry_type: "general" | "sample" | "catalog";  # 严格类型限制
  status?: "pending" | "processing" | "completed";
  created_at?: string;
}

// API响应类型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message: string;
  timestamp: string;
}
```

### 数据库表结构

#### products表
```sql
CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  fabric VARCHAR(100) NOT NULL,
  style VARCHAR(100) NOT NULL,
  season VARCHAR(100) NOT NULL,
  images JSON,                         -- JSON格式存储图片数组
  specifications JSON,                 -- JSON格式存储规格信息
  featured ENUM('yes','no') DEFAULT 'no',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### inquiries表
```sql
CREATE TABLE inquiries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL,
  business_type VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  product_id INT,
  inquiry_type ENUM('general','sample','catalog') DEFAULT 'general',
  status ENUM('pending','processing','completed') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🛠️ API接口规范

### 基础URL
- **开发环境**: `http://localhost:5173/api`
- **生产环境**: `/api`

### 产品API (`/api/products.php`)

#### GET /api/products - 获取产品列表
**查询参数**:
```typescript
{
  page?: number;              // 页码 (默认: 1)
  limit?: number;             // 每页数量 (默认: 12)
  category?: string;          // 分类过滤
  fabric?: string;            // 材质过滤
  season?: string;            // 季节过滤
  style?: string;             // 风格过滤
  search?: string;            // 搜索关键词
  featured?: "yes" | "no";    // 是否特色产品
}
```

**响应格式**:
```typescript
{
  success: boolean;
  data: {
    products: Product[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  message: string;
  timestamp: string;
}
```

#### GET /api/products.php?id={id} - 获取单个产品
**响应**: `ApiResponse<Product>`

### 分类API (`/api/categories.php`)
#### GET /api/categories - 获取所有过滤选项
```typescript
{
  success: boolean;
  data: {
    categories: string[];
    fabrics: string[];
    styles: string[];
    seasons: string[];
  };
  message: string;
  timestamp: string;
}
```

### 联系API (`/api/contact.php`)
#### POST /api/contact - 提交询价
**请求体**: `Inquiry`对象
**响应**: `ApiResponse<{ inquiry_id: number }>`

## 🎨 UI组件系统

### 设计原则
- **无障碍访问**: 基于Radix UI，符合WAI-ARIA标准
- **响应式设计**: Tailwind CSS响应式前缀
- **类型安全**: 完整TypeScript类型定义
- **主题定制**: CSS变量实现主题切换
- **样式隔离**: `cn`工具函数处理样式合并

### 组件分类

#### 基础UI组件 (`components/ui/`)
- `button.tsx` - 按钮组件 (多种变体)
- `input.tsx` - 输入框组件
- `card.tsx` - 卡片组件
- `dialog.tsx` - 对话框组件
- `carousel.tsx` - 轮播组件
- `toast.tsx` - 消息提示组件

#### 业务组件 (`components/`)
- `header.tsx` - 头部导航 (包含语言切换)
- `footer.tsx` - 页脚组件
- `hero-section.tsx` - 首页横幅
- `product-modal.tsx` - 产品详情弹窗
- `category-carousel.tsx` - 分类轮播
- `category-filter.tsx` - 产品筛选
- `featured-collection.tsx` - 精选产品系列
- `contact-section.tsx` - 联系表单

### 组件使用示例
```tsx
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import ProductModal from "@/components/product-modal";

// 使用组件
<Button variant="primary" size="lg">
  查看详情
</Button>

<ProductModal 
  isOpen={isModalOpen}
  productId={selectedProductId}
  onClose={() => setIsModalOpen(false)}
/>
```

## 🔄 状态管理

### React Query 配置 (`lib/queryClient.ts`)
```typescript
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5分钟缓存
      cacheTime: 10 * 60 * 1000,     // 10分钟垃圾回收
      retry: 3,                       // 失败重试3次
      refetchOnWindowFocus: false,    // 窗口聚焦不自动重新获取
    },
  },
});

// API请求封装
export async function apiGet<T>(endpoint: string): Promise<T> {
  const res = await fetch(`/api/${endpoint}`);
  const result: ApiResponse<T> = await res.json();
  
  if (!result.success) {
    throw new Error(result.message || 'API请求失败');
  }
  
  return result.data as T;
}
```

### 常用Query Keys
```typescript
// 产品相关
export const QUERY_KEYS = {
  products: ['products'] as const,
  productList: (filters: ProductFilters) => ['products', 'list', filters] as const,
  productDetail: (id: string) => ['products', 'detail', id] as const,
  categories: ['categories'] as const,
} as const;
```

## 🎯 开发指导原则

### 代码规范

#### TypeScript 严格模式
- 启用所有严格检查选项
- 禁止使用 `any` 类型
- 必须为所有函数参数和返回值指定类型
- 使用 `shared/schema.ts` 中的类型定义

#### 组件命名规范
- 组件文件使用 `kebab-case.tsx`
- 组件名使用 `PascalCase`
- Hook文件使用 `use-feature-name.tsx`
- 类型文件使用 `index.ts`

#### 导入规范
```typescript
// 1. React相关导入
import { useState, useEffect } from 'react';

// 2. 第三方库导入
import { useQuery } from '@tanstack/react-query';

// 3. 内部组件导入
import { Button } from '@/components/ui/button';

// 4. 共享类型导入
import type { Product } from '@shared/schema';

// 5. 相对路径导入(仅同级目录)
import './component.css';
```

### 项目架构要求

#### 遵循SampleShowcase结构
- **严格按照** SampleShowcase项目结构作为标准模板
- 新增组件必须放在对应的目录中
- 遵循现有的命名约定和文件组织方式

#### 类型安全要求
- Product类型中 `images` 字段必须为 `string[]`
- `featured` 字段必须为 `"yes" | "no"`
- `inquiryType` 字段必须为 `"general" | "sample" | "catalog"`
- 所有API响应必须符合 `ApiResponse<T>` 格式

#### 文件修改原则
- 每次只修改一个文件
- 给用户机会发现错误
- 不要移除无关代码或功能
- 保持现有结构完整性
- 在单个chunks中提供所有编辑

### 最佳实践

#### 组件设计
```typescript
// ✅ 好的组件设计
interface ProductCardProps {
  product: Product;
  onSelect: (productId: string) => void;
  className?: string;
}

export function ProductCard({ product, onSelect, className }: ProductCardProps) {
  return (
    <Card className={cn("hover:shadow-lg transition-shadow", className)}>
      {/* 组件内容 */}
    </Card>
  );
}

// ❌ 避免的写法
export function ProductCard(props: any) {
  // 缺少类型定义
}
```

#### API调用
```typescript
// ✅ 使用React Query
function useProducts(filters: ProductFilters) {
  return useQuery({
    queryKey: QUERY_KEYS.productList(filters),
    queryFn: () => apiGet<ProductListResponse>(`products?${new URLSearchParams(filters)}`),
    staleTime: 5 * 60 * 1000,
  });
}

// ❌ 直接使用fetch
useEffect(() => {
  fetch('/api/products').then(res => res.json()).then(setProducts);
}, []);
```

#### 错误处理
```typescript
// ✅ 完整的错误处理
try {
  const products = await apiGet<Product[]>('products');
  return products;
} catch (error) {
  console.error('获取产品失败:', error);
  throw new Error('无法加载产品数据');
}

// ❌ 忽略错误
const products = await apiGet('products');
```

## 🔧 开发流程

### 开发环境启动
```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器 (http://localhost:5173)
npm run dev

# 3. 类型检查
npm run check
```

### 构建流程
```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

### 文件修改流程
1. 使用 `search_replace` 工具进行文件编辑
2. 每次只修改一个文件
3. 修改后立即使用 `get_problems` 验证
4. 确保类型检查通过
5. 测试功能正常

## 🧪 测试策略

### 组件测试
- 测试组件渲染
- 测试用户交互
- 测试状态变化
- 测试API集成

### API测试
- 测试所有端点
- 测试参数验证
- 测试错误处理
- 测试响应格式

## 🚀 部署配置

### 构建输出
- 静态文件输出到 `dist/` 目录
- 适用于Hostinger等共享主机
- 支持Apache/Nginx反向代理

### 环境变量
```bash
# 开发环境
NODE_ENV=development
VITE_API_URL=http://localhost:8080/api

# 生产环境  
NODE_ENV=production
VITE_API_URL=/api
```

## 📝 常见任务

### 添加新组件
1. 在 `client/src/components/` 创建组件文件
2. 定义TypeScript接口
3. 使用Tailwind CSS样式
4. 导出组件并在需要的地方引入

### 添加新API端点
1. 在 `api/` 目录创建PHP文件
2. 实现RESTful接口
3. 返回标准JSON响应格式
4. 在前端创建对应的查询函数

### 修改数据类型
1. 更新 `shared/schema.ts`
2. 更新数据库表结构
3. 更新相关组件和API
4. 运行类型检查确保一致性

## ⚠️ 重要注意事项

### 必须遵循的规则
1. **严格的TypeScript类型检查** - 不允许使用 `any`
2. **SampleShowcase结构标准** - 必须完全按照此结构
3. **文件逐个修改** - 不要并行修改多个文件
4. **保持现有功能** - 不要移除无关代码
5. **API响应格式** - 必须符合 `ApiResponse<T>` 标准

### 开发限制
- 不使用Node.js作为生产服务器
- 仅在开发时使用Vite
- 生产环境为纯静态文件 + PHP API
- 支持共享主机部署

---

> 这个文档为AI开发助手提供了完整的项目理解，包括架构、规范、最佳实践和具体的开发指导。在进行任何代码修改时，请参考这些规范确保代码质量和项目一致性。