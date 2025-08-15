# Fashion Factory Display System

时尚工厂产品展示系统，专为服装工厂向客户展示产品系列而设计。系统专注于优雅的产品展示和客户互动，而非直接电商功能。

## 📋 目录

- [项目总结](#-项目总结)
- [项目结构](#-项目结构)
- [项目技术栈](#-项目技术栈)
- [项目功能](#-项目功能)
- [快速开始](#-快速开始)
- [配置说明](#-配置说明)
- [自定义设置](#-自定义设置)
- [许可证](#-许可证)

## 🎯 项目总结

这个系统是服装批发工厂的数字产品目录，主要用途：
- 向潜在客户展示服装系列
- 支持桌面和手机设备浏览
- 方便客户联系我们
- 提供实时产品管理功能
- 通过数据分析跟踪客户互动

## 📁 项目结构

```
htdocs/
├── index.html              # 主产品展示页面
├── product.html            # 产品详情页面
├── admin/                  # 管理后台
│   ├── assets/             # 管理后台资源
│   │   ├── css/            # 管理后台样式
│   │   │   └── admin_style.css
│   │   ├── js/             # 管理后台脚本
│   │   │   └── components/ # 管理后台组件
│   ├── components/         # 管理后台PHP组件
│   ├── dashboard.php       # 主管理面板
│   └── login.html          # 管理登录页面
├── api/                    # PHP后端接口
├── assets/                 # 前台网站资源
│   ├── css/                # 前台样式文件
│   │   ├── font-fallback.css
│   │   └── style.css
│   ├── js/                 # 前台JavaScript文件
│   │   ├── components/     # 前台组件
│   │   ├── utils/          # 工具函数
│   │   │   └── apiClient.js          # API客户端
│   │   ├── lib/            # 前台库文件
│   │   ├── script.js       # 首页入口文件
│   │   └── product.js      # 产品页入口文件
└── images/                 # 上传的产品图片
```

## 🛠️ 项目技术栈

### 前端技术
- **HTML5**: 语义化页面结构
- **CSS3**: 现代样式设计，使用CSS变量和BEM方法
- **JavaScript (ES6+)**: 模块化开发，组件化架构
- **字体**: Inter + Playfair Display，支持回退方案

### 后端技术
- **PHP 7+**: 服务器端逻辑
- **MySQL**: 数据库存储
- **mysqli**: 数据库连接，使用预处理语句防SQL注入

### 架构特点
- **模块化设计**: 每个组件独立，职责单一
- **事件驱动**: 组件间通过事件总线通信
- **响应式布局**: 适配桌面和手机设备
- **性能优化**: 图片懒加载、压缩、字体优化

## ✨ 项目功能

### 🖥️ 前台展示功能
- **产品展示**: 优雅的意大利时尚风格设计，支持分类筛选
- **响应式设计**: 桌面和手机设备都能良好显示
- **产品详情**: 高质量图片展示，详细产品描述
- **联系功能**: 方便客户联系咨询下单
- **意大利语界面**: 原生意大利语界面，提供真实体验

### 🛠️ 后台管理功能
- **产品管理**: 完整的增删改查操作
- **媒体库**: 集中图片管理，使用情况跟踪
- **分类管理**: 动态组织产品分类
- **响应式后台**: 任何设备都能管理商店
- **变体构建器**: 一次提交添加多个颜色变体，每个颜色成为独立产品记录

### ⚡ 性能优化功能
- **图片优化**: 自动压缩和懒加载，快速加载
- **性能监控**: 实时核心网页指标跟踪
- **优化加载**: 自定义字体和资源加载策略
- **轻量快速**: 专为快速体验设计，特别是手机端

### 🔒 安全功能
- **安全管理**: 基于会话的管理员认证
- **SQL注入防护**: 使用预处理语句保护数据库
- **安全文件上传**: 严格验证和唯一命名所有上传媒体

### 📊 数据分析功能
- **仪表板统计**: 跟踪总产品数、分类数和媒体使用情况
- **客户互动**: 查看热门产品和分类统计

## 🚀 快速开始

按照以下步骤在本地机器上运行项目。

### 环境要求
- PHP 7+ 并安装 `mysqli` 扩展
- MySQL 数据库服务器
- Apache 或 Nginx 等网页服务器
- `images/` 目录的写入权限

### 安装步骤

1.  **下载项目**
    ```sh
    git clone https://github.com/your-username/fashion-factory-display.git
    ```
    或下载项目ZIP文件并解压到网页服务器根目录（如XAMPP的 `htdocs`）。

2.  **数据库设置**
    - 在MySQL中创建新数据库（如 `products`）
    - 执行以下SQL查询导入数据库结构（新三表结构）：
      ```sql
      CREATE TABLE categories (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        category_name VARCHAR(100) NOT NULL UNIQUE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

      CREATE TABLE products (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        base_name VARCHAR(255) NOT NULL,
        description TEXT NULL,
        category_id INT UNSIGNED NULL,
        CONSTRAINT fk_products_category
          FOREIGN KEY (category_id) REFERENCES categories(id)
          ON DELETE SET NULL ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

      CREATE TABLE `colors` (
        `id` int(11) UNSIGNED NOT NULL,
        `color_name` varchar(100) NOT NULL COMMENT '颜色名称 (例如: Red, Blue)',
        `color_code` varchar(7) DEFAULT NULL COMMENT '颜色的HEX代码 (例如: #FF0000)'
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='产品颜色表';

      CREATE TABLE `materials` (
        `id` int(11) UNSIGNED NOT NULL,
        `material_name` varchar(100) NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='产品材质表';

      CREATE TABLE `tags` (
        `id` int(11) UNSIGNED NOT NULL,
        `tag_name` varchar(100) NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='产品标签表';

      CREATE TABLE product_variants (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        product_id INT UNSIGNED NOT NULL,
        color_id INT UNSIGNED DEFAULT NULL,
        material_id INT UNSIGNED DEFAULT NULL,
        default_image VARCHAR(255) NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_variants_product
          FOREIGN KEY (product_id) REFERENCES products(id)
          ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT fk_variant_color
          FOREIGN KEY (color_id) REFERENCES colors(id)
          ON DELETE SET NULL ON UPDATE CASCADE,
        CONSTRAINT fk_variant_material
          FOREIGN KEY (material_id) REFERENCES materials(id)
          ON DELETE SET NULL ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

      CREATE TABLE product_media (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        variant_id INT UNSIGNED NOT NULL,
        image_path VARCHAR(255) NOT NULL,
        sort_order INT UNSIGNED NOT NULL DEFAULT 0,
        CONSTRAINT fk_media_variant
          FOREIGN KEY (variant_id) REFERENCES product_variants(id)
          ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

      CREATE TABLE `product_tags` (
        `product_id` int(11) UNSIGNED NOT NULL,
        `tag_id` int(11) UNSIGNED NOT NULL,
        PRIMARY KEY (`product_id`,`tag_id`),
        CONSTRAINT `fk_pt_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
        CONSTRAINT `fk_pt_tag` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='产品与标签的关联表';
      ```

3.  **环境配置**
    - 打开 `api/config.php` 并更新数据库信息（本地 XAMPP 默认配置如下）：
      ```php
      define('DB_HOST', 'localhost');
      define('DB_USER', 'root');
      define('DB_PASS', '');
      define('DB_NAME', 'products');
      ```

4.  **设置权限**
    - 确保网页服务器对 `images/` 目录有写入权限。在Linux/macOS上可以运行：
      ```sh
      chmod 755 images/
      ```

5.  **访问管理后台**
    - 在浏览器中访问 `/admin/login.html`
    - 默认登录信息：
        - **用户名**: `admin`
        - **密码**: `admin`

## 🔧 配置说明

- **数据库**: 所有数据库设置都在 `api/config.php` 中
- **管理员密码**: 生产环境中必须更改默认密码。生成新哈希并更新 `api/config.php` 中的 `ADMIN_PASSWORD_HASH`

## 🎨 自定义设置

- **样式**: 修改 `assets/css/style.css` 中的CSS变量来改变主题
- **内容**: 在 `index.html` 和其他相关文件中更新联系信息和品牌信息


## 📄 许可证

本项目专为时尚工厂和制造商商业使用而设计。

## 🔀 变体（Variant）API 扩展

为修复与增强后台“变体”查看/编辑能力，新增/完善以下接口与字段：

- GET `/api/products.php?id={variant_id}`
  - 新增返回字段：`siblings: Array<{ id, name, defaultImage, createdAt }>`（同一 `product_id` 下的所有变体，用于前/后台无二义地构建变体组）

- GET `/api/products.php?product_id={product_id}`
  - 返回该产品下的所有变体：`[{ id, name, defaultImage, createdAt }]`

- POST `/api/products.php`（更新变体，传 `id` 即视为更新）
  - 支持新字段：
    - `default_image_path: string`（将已存在图片路径直接设为默认图，无需重新上传）
    - `media_order: string[] | JSON`（对已存在的媒体按数组顺序重排 `sort_order`）
    - `delete_media: string[] | JSON`（删除指定路径的媒体文件记录）
  - 兼容原有上传：`media[]` 新增媒体，自动顺序写入 `sort_order`

- POST `/api/products.php`（创建产品及变体）
  - 批量创建：
    - `variants_meta: JSON`，形如：`[{ index: 0, color: "Red" }, ...]`
    - 为每个索引上传图片字段：`variant_media_{index}[]`
  - 简单创建：
    - `variants: string[] | JSON`（仅名称，无独立媒体上传）
  - 单变体创建：
    - 颜色通过 `color: string` 指定；`media[]` 图片

以上更改确保：
- 后台编辑页可直接展示与切换同组变体；
- 已保存媒体可设置默认图、支持删除与拖拽顺序（通过按钮“上移/下移”实现），更新统一走 POST；
- 前台详情页优先使用后端 `siblings` 构建无二义的变体切换（回退到同分类聚合）。
