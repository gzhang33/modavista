# Playwright 测试外部管理指南

## 概述

本项目的 Playwright 测试已重构为外部管理模式。**所有测试文件的创建、维护和执行都通过外部 Playwright MCP 工具处理，本项目不再包含任何本地测试文件。**


### ✅ 本项目现在提供：
- 测试环境要求文档
- 关键测试场景指导
- 外部工具配置建议

## Playwright 配置


## 测试环境要求

在使用外部 Playwright MCP 工具之前，确保以下环境已准备就绪：

### 服务器要求
- **Apache/XAMPP**: 必须在 localhost 运行
- **MySQL**: 数据库服务活跃，包含产品数据
- **PHP**: 支持执行 API 端点

### 配置要求
- `api/config.php` 正确配置数据库连接
- 管理员凭据设置：用户名 `admin`，密码 `admin`
- `images/` 目录具有写权限

### 访问验证
确保以下页面可以通过 `http://localhost` 访问：
- `/index.html` - 主页
- `/product.html` - 产品详情页
- `/admin/login.html` - 管理员登录
- `/admin/dashboard.php` - 管理后台

## 关键测试场景

外部测试工具应覆盖以下关键场景：

### 1. 公共站点功能
- **主页** (`/index.html`):
  - 产品网格正确加载
  - 分类导航功能
  - 移动端响应式导航
  - ES6 模块加载（ProductGrid, MobileNavigation）

- **产品详情页** (`/product.html`):
  - 产品信息显示
  - 图片画廊功能
  - 相关产品加载
  - 面包屑导航

### 2. 管理面板功能
- **登录流程** (`/admin/login.html`):
  - 有效/无效凭据处理
  - 会话管理
  - 重定向到仪表板

- **仪表板** (`/admin/dashboard.php`):
  - 统计数据显示和刷新
  - 产品表格加载
  - CRUD 操作
  - 批量操作
  - 会话过期处理

### 3. API 端点测试
- `GET /api/products.php` - 产品列表
- `GET /api/products.php?id={id}` - 单个产品
- `GET /api/categories.php` - 分类列表
- `POST /api/login.php` - 管理员认证
- `POST /api/products.php` - 创建/更新产品（仅管理员）
- `DELETE /api/products.php` - 删除产品（仅管理员）

### 4. 错误处理验证
- 网络故障处理
- 无效 API 响应
- 会话过期（401 响应）
- 缺失产品数据
- 图片加载失败

## 使用外部 Playwright MCP 工具

### 配置管理
外部工具应使用自己的配置，建议包含以下设置：
- Base URL: `http://localhost`
- 视口大小: 1280x800
- 失败时保留跟踪

### 测试数据期望
外部测试工具应期望：
- 意大利时尚产品数据
- 至少一个管理员用户 (admin/admin)
- `/images/` 目录中的产品图片
- 分类如 "Abbigliamento", "Accessori"
- 包含颜色选项的产品变体

### 性能测试标准
- 页面加载时间 < 3 秒
- ES6 模块加载性能
- 图片优化和加载
- API 响应时间 < 500ms
- 移动端性能指标

## 无障碍测试
外部工具应使用 `@axe-core/playwright` 验证：
- WCAG 2.1 AA 合规性
- 键盘导航和焦点管理
- ARIA 属性和语义标记
- 屏幕阅读器兼容性

## 故障排除

如果外部测试失败，检查：

1. **服务器状态**:
   ```bash
   # 检查 Apache 是否运行
   netstat -an | findstr :80
   ```

2. **数据库连接**:
   - 验证 `api/config.php` 中的数据库凭据
   - 确保 MySQL 服务运行

3. **文件权限**:
   - 确保 `images/` 目录可写
   - 验证 API 文件可执行

4. **API 响应**:
   - 手动访问 `http://localhost/api/products.php`
   - 检查是否返回 JSON 而非 HTML 错误
