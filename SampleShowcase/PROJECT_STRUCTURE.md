# DreaModa 项目文件结构说明

## 项目概述
DreaModa已成功改造为React前端 + PHP后端的现代化前后端分离架构，适用于Hostinger共享主机部署。

## 本地开发环境文件结构

```
SampleShowcase/                          # 项目根目录
├── client/                               # React前端源码
│   ├── src/
│   │   ├── components/                   # React组件
│   │   ├── pages/                        # 页面组件
│   │   ├── lib/                          # 工具库
│   │   │   └── queryClient.ts           # API客户端 (已适配PHP后端)
│   │   ├── types/                        # TypeScript类型定义
│   │   │   └── index.ts                 # 导出共享类型
│   │   └── App.tsx                      # 主应用组件
│   ├── public/                          # 静态资源
│   └── package.json                     # 前端依赖
├── shared/                              # 共享类型定义
│   └── schema.ts                        # 适配DreaModa API的类型定义
├── dist/                                # 构建输出目录 (部署用)
│   ├── index.html                       # 主页面
│   ├── .htaccess                        # Apache配置 (SPA路由+API代理)
│   └── assets/                          # 编译后的CSS/JS文件
├── api_example/                         # PHP API示例代码
│   ├── index.php                        # API入口文件
│   ├── config/
│   │   └── database.php                 # 数据库配置
│   ├── endpoints/
│   │   ├── products.php                 # 产品API
│   │   ├── inquiries.php               # 询价API
│   │   └── categories.php              # 分类API
│   └── .htaccess                        # API路由配置
├── vite.config.ts                       # Vite构建配置 (纯前端)
├── package.json                         # 主要依赖配置
├── database_schema.sql                  # 数据库表结构
├── DEPLOYMENT_GUIDE.md                  # 详细部署指南
└── README.md                           # 项目说明
```

## 生产环境部署结构 (Hostinger)

```
public_html/                             # Hostinger网站根目录
├── index.html                           # React应用主页面
├── .htaccess                            # Apache配置文件
│   ├── React SPA路由配置
│   ├── API请求转发配置
│   ├── 静态资源缓存配置
│   └── 安全性配置
├── assets/                              # 静态资源目录
│   ├── index-[hash].js                  # 主应用JS文件
│   ├── vendor-[hash].js                 # 第三方库JS文件
│   ├── ui-[hash].js                     # UI组件JS文件
│   └── index-[hash].css                 # 样式文件
└── api/                                 # PHP后端API目录
    ├── index.php                        # API路由入口
    ├── .htaccess                        # API路由配置
    ├── config/
    │   └── database.php                 # 数据库连接配置
    └── endpoints/
        ├── products.php                 # 产品相关API
        ├── inquiries.php               # 询价相关API
        └── categories.php              # 分类相关API
```

## 核心配置文件说明

### 1. vite.config.ts - 前端构建配置
```typescript
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
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // 开发环境PHP服务器
        changeOrigin: true,
      }
    }
  }
});
```

### 2. dist/.htaccess - 生产环境Apache配置
- **React SPA路由**: 将非文件请求重定向到index.html
- **API代理**: 将/api请求转发到PHP后端
- **缓存策略**: 静态资源长期缓存，HTML不缓存
- **压缩**: 启用Gzip压缩减少传输大小
- **安全**: 防止访问敏感文件

### 3. shared/schema.ts - TypeScript类型定义
```typescript
export interface Product {
  id: number | string;
  name: string;
  description: string;
  category: string;
  fabric: string;
  style: string;
  season: string;
  images: string[];           // 严格类型检查
  featured: "yes" | "no";     // 严格类型检查
  // ... 其他字段
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message: string;
  timestamp: string;
}
```

### 4. client/src/lib/queryClient.ts - API客户端
```typescript
const API_BASE_URL = import.meta.env.PROD ? '/api' : '/api';

export async function apiGet<T>(endpoint: string): Promise<T> {
  const res = await apiRequest('GET', endpoint);
  const result: ApiResponse<T> = await res.json();
  
  if (!result.success) {
    throw new Error(result.message || 'API请求失败');
  }
  
  return result.data as T;
}
```

## API端点规范

### 产品API (`/api/products`)
- `GET /api/products` - 获取产品列表 (支持分页和过滤)
- `GET /api/products/{id}` - 获取单个产品详情
- `POST /api/products` - 创建新产品 (管理功能)

**查询参数**:
- `page`: 页码 (默认: 1)
- `limit`: 每页数量 (默认: 12)
- `category`: 分类过滤
- `fabric`: 材质过滤
- `season`: 季节过滤
- `style`: 风格过滤
- `search`: 搜索关键词
- `featured`: 是否特色产品

### 询价API (`/api/inquiries`)
- `GET /api/inquiries` - 获取询价列表 (管理功能)
- `POST /api/inquiries` - 提交新询价

### 分类API (`/api/categories`)
- `GET /api/categories` - 获取所有过滤选项

## 数据库表结构

### products表
```sql
CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  fabric VARCHAR(100) NOT NULL,
  style VARCHAR(100) NOT NULL,
  season VARCHAR(100) NOT NULL,
  images JSON,
  specifications JSON,
  featured ENUM('yes','no') DEFAULT 'no',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### inquiries表
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

## 构建和部署命令

### 本地开发
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# TypeScript类型检查
npm run check
```

### 生产构建
```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

### 部署步骤
1. 执行 `npm run build` 构建前端
2. 将 `dist/` 目录内容上传到 `public_html/`
3. 将 `api_example/` 内容上传到 `public_html/api/`
4. 配置数据库连接信息
5. 执行 `database_schema.sql` 创建数据库表
6. 测试网站功能

## 关键特性

### 前端特性
- **React 18 + TypeScript**: 现代化前端框架
- **响应式设计**: 适配各种设备屏幕
- **SPA路由**: 无刷新页面切换
- **状态管理**: React Query进行API状态管理
- **组件化**: 高度模块化的组件结构
- **类型安全**: 严格的TypeScript类型检查

### 后端特性
- **RESTful API**: 标准化API设计
- **JSON响应**: 统一的响应格式
- **错误处理**: 完善的错误处理机制
- **数据验证**: 输入数据验证和清理
- **安全性**: SQL注入防护和输入过滤
- **CORS支持**: 跨域请求处理

### 部署特性
- **静态文件部署**: 无需Node.js运行环境
- **共享主机兼容**: 适用于Hostinger等共享主机
- **缓存优化**: 静态资源长期缓存
- **SEO友好**: 服务端渲染的HTML结构
- **性能优化**: Gzip压缩和资源分包

## 维护和更新

### 前端更新流程
1. 修改源码
2. 本地测试 (`npm run dev`)
3. 类型检查 (`npm run check`)
4. 构建生产版本 (`npm run build`)
5. 上传新的静态文件到Hostinger

### 后端更新流程
1. 修改PHP代码
2. 本地测试API端点
3. 上传更新的PHP文件
4. 更新数据库结构 (如需要)
5. 清除相关缓存

### 监控要点
- API响应时间
- 错误日志
- 数据库查询性能
- 用户询价转化率
- 页面加载速度

这个架构确保了项目的可维护性、可扩展性和高性能，同时最大化了在共享主机环境下的兼容性。