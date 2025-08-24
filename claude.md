# Fashion Factory Display System - Claude Reference Guide

## Deliverable
Complete reference documentation for Fashion Factory Display System - a PHP/MySQL product showcase application for clothing manufacturers.

## Project Overview

### Purpose
Fashion Factory Display System 是专为服装工厂设计的产品展示系统，主要用于向潜在客户展示产品系列，而非直接电商功能。系统支持桌面和移动设备，提供产品管理和客户互动功能。

### Core Architecture
- **Frontend**: HTML5 + CSS3 + Vanilla ES6+ JavaScript (模块化组件架构)
- **Backend**: PHP 7+ + mysqli
- **Database**: MySQL (utf8mb4)
- **Environment**: XAMPP/Apache development environment

## Database Schema

### Primary Tables Structure
```sql
-- Categories table
categories: id, category_name (VARCHAR 100)

-- Main products table  
products: id, base_name, description, category_id (FK)

-- Colors reference table
colors: id, color_name, color_code (HEX)

-- Materials reference table
materials: id, material_name

-- Product variants (color/material combinations)
product_variants: id, product_id (FK), color_id (FK), material_id (FK), 
                  default_image, created_at

-- Media files for each variant
product_media: id, variant_id (FK), image_path, sort_order

-- Tags system
tags: id, tag_name
product_tags: product_id (FK), tag_id (FK)
```

### Key Relationships
- Products belong to categories (products.category_id → categories.id)
- Product variants extend products with color/material combinations
- Media files are linked to specific variants
- Many-to-many relationship between products and tags

## File Structure

### Root Directory Structure
```
/htdocs/
├── index.html                    # 主展示页面 (Italian locale)
├── product.html                  # 产品详情页面
├── README.md                     # 项目文档
├── HOSTINGER_DEPLOYMENT.md       # 部署文档
│
├── /admin/                       # 管理后台
│   ├── dashboard.php             # 产品管理主界面
│   ├── add_product.php           # 添加/编辑产品页面
│   ├── edit_product.php          # 产品编辑页面
│   ├── login.html                # 管理员登录
│   └── /assets/                  # 后台静态资源
│       ├── /css/                 # 后台样式文件
│       └── /js/                  # 后台JavaScript组件
│
├── /api/                         # PHP API接口
│   ├── config.php                # 数据库配置和常量
│   ├── products.php              # 产品CRUD API
│   ├── categories.php            # 分类管理API
│   ├── colors.php                # 颜色管理API
│   ├── materials.php             # 材质管理API
│   ├── media.php                 # 媒体上传API
│   ├── login.php                 # 管理员认证
│   ├── check_session.php         # 会话验证
│   └── utils.php                 # 公共工具函数
│
├── /assets/                      # 前端静态资源
│   ├── /css/                     # 样式文件
│   └── /js/                      # JavaScript模块
│       ├── /components/          # UI组件
│       ├── /utils/               # 工具函数
│       └── /lib/                 # 第三方库
│
├── /images/                      # 上传图片存储
└── /tools/                       # 部署和导出脚本
```

### API Endpoints

#### Products API (`/api/products.php`)
- `GET /api/products.php` - 获取产品列表 (supports filtering)
- `GET /api/products.php?id={id}` - 获取单个产品详情
- `POST /api/products.php` - 创建新产品 (requires auth)
- `DELETE /api/products.php?id={id}` - 删除产品 (requires auth)

#### Categories API (`/api/categories.php`)
- `GET /api/categories.php` - 获取所有分类
- `POST /api/categories.php` - 创建分类 (requires auth)
- `DELETE /api/categories.php?id={id}` - 删除分类 (requires auth)

#### Media API (`/api/media.php`)
- `POST /api/media.php` - 上传产品图片 (requires auth)
- Image optimization and compression built-in

## Key Components

### Frontend Components (ES6 Modules)

#### Main Application (`/assets/js/script.js`)
- **MainApp class**: 主页应用程序协调器
- Imports and initializes ProductGrid, MobileNavigation
- Handles app-wide initialization

#### Product Grid (`/assets/js/components/ProductGrid.js`)
- Product display and filtering logic
- Search functionality
- Category-based filtering
- Responsive grid layout

#### Product Details (`/assets/js/components/ProductDetails.js`)
- Single product detail page logic
- Image gallery integration
- Variant selection (color/material)

#### Mobile Navigation (`/assets/js/components/MobileNavigation.js`)
- Mobile-responsive navigation menu
- Touch-friendly interface

#### Admin Components (`/admin/assets/js/`)
- **ComponentManager**: 后台组件管理器
- **dashboard_products**: 产品管理表格
- **add_product**: 产品添加/编辑表单
- **ToastComponent**: 通知组件

### Backend Architecture

#### Configuration (`/api/config.php`)
- Database connection settings (localhost/root/empty password)
- Admin password hash (`admin` default)
- Upload directory configuration
- Allowed file extensions for uploads

#### Authentication System
- Session-based admin authentication
- Password verification using PHP's `password_hash()`
- Session validation for protected endpoints

#### Utility Functions (`/api/utils.php`)
- `json_response()`: Standardized JSON responses
- `require_auth()`: Authentication middleware
- Input validation and sanitization helpers

## Development Notes

### Technology Stack Details
- **Frontend**: Vanilla JavaScript ES6+, CSS Grid/Flexbox, CSS Custom Properties
- **Backend**: PHP 7+ with mysqli extension
- **Database**: MySQL 5.7+ (utf8mb4 charset)
- **Image Processing**: PHP GD extension for image optimization
- **File Upload**: Custom PHP upload handler with compression

### Security Features
- SQL injection prevention via prepared statements
- XSS protection through input sanitization  
- CSRF protection in admin forms
- File upload validation and type checking
- Session-based authentication

### Performance Optimizations
- Image compression and optimization
- CSS/JS minification and caching
- Font loading optimization
- Responsive image serving
- Performance monitoring utilities

## Configuration Settings

### Database Configuration (`/api/config.php`)
```php
define('DB_HOST', 'localhost');
define('DB_USER', 'root'); 
define('DB_PASS', '');
define('DB_NAME', 'products');
```

### Default Admin Credentials
- Username: `admin`
- Password: `admin`
- Hash stored in: `ADMIN_PASSWORD_HASH` constant

### Upload Settings
- Directory: `/images/` (项目根目录)
- Allowed extensions: jpg, jpeg, png, gif, webp
- Image optimization: automatic compression

## Assumptions and To Confirm

1. Project runs in XAMPP environment with default MySQL settings
2. Apache mod_rewrite enabled for clean URLs
3. PHP GD extension available for image processing
4. Write permissions set correctly on `/images/` directory

## Next Actions

1. 设置本地开发环境 (XAMPP)
2. 导入数据库结构到MySQL
3. 配置 `/api/config.php` 数据库连接
4. 设置图片目录权限
5. 访问 `/admin/login.html` 开始产品管理

## References

- Main codebase structure follows MVC-like pattern
- Italian localization for frontend display
- Responsive design with mobile-first approach
- Component-based JavaScript architecture
- RESTful API design principles