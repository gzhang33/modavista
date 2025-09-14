# Hostinger部署指南

## 概述

本指南详细说明如何将Dreamoda项目部署到Hostinger共享主机环境。

## 部署前准备

### 1. 环境要求检查

- PHP 8.0+
- MySQL 8.0+
- Apache with mod_rewrite
- SSL证书（自动提供）

### 2. 构建前端应用

```bash
# 在项目根目录执行
cd frontend
npm install
npx vite build
```

### 3. 数据库准备

在Hostinger控制面板中：
1. 创建MySQL数据库
2. 创建数据库用户
3. 记录连接信息

## 部署步骤

### 1. 打包项目

```powershell
# 从项目根目录运行
powershell -ExecutionPolicy Bypass -File scripts/deploy/pack_for_hostinger.ps1
```

### 2. 上传文件

1. 登录Hostinger hPanel
2. 进入File Manager
3. 导航到`public_html/`目录
4. 上传生成的ZIP文件
5. 解压到根目录

### 3. 配置数据库

创建`.env`文件在根目录：

```env
# Hostinger生产环境配置
APP_ENV=production
APP_DEBUG=false

# 数据库配置 - 替换为你的实际配置
DB_HOST_PROD=localhost
DB_USER_PROD=你的数据库用户名
DB_PASS_PROD=你的数据库密码
DB_NAME_PROD=你的数据库名
DB_PORT_PROD=3306

# 网站配置
SITE_URL_PROD=https://dreamoda.store
FRONTEND_URL_PROD=https://dreamoda.store
API_BASE_URL_PROD=https://dreamoda.store/backend/api

# CORS配置
CORS_ALLOWED_ORIGINS_PROD=https://dreamoda.store,https://www.dreamoda.store

# 上传配置
UPLOAD_DIR_PROD=storage/uploads
UPLOAD_MAX_SIZE=5242880

# 缓存配置
CACHE_TTL=3600
CACHE_DRIVER=file

# 日志配置
LOG_LEVEL=error
LOG_FILE=storage/logs/app.log

# 安全配置
SESSION_SECURE=true
COOKIE_SECURE=true
```

### 4. 设置文件权限

```bash
# 设置存储目录权限
chmod 755 storage/
chmod 755 storage/uploads/
chmod 755 storage/logs/
```

### 5. 导入数据库

1. 进入phpMyAdmin
2. 选择你的数据库
3. 导入SQL文件

### 6. 验证部署

访问以下URL进行验证：
- 主页：`https://dreamoda.store/`
- API测试：`https://dreamoda.store/backend/api/products.php`
- 管理后台：`https://dreamoda.store/backend/admin/`

## 性能优化

### 1. 启用Gzip压缩

已在`.htaccess`中配置。

### 2. 设置缓存头

已在`.htaccess`中配置静态资源缓存。

### 3. 启用OPcache

已在`.htaccess`中配置PHP OPcache。

## 安全配置

### 1. 安全头

已在`.htaccess`中配置：
- X-Content-Type-Options
- X-Frame-Options
- X-XSS-Protection
- Strict-Transport-Security
- Content-Security-Policy

### 2. 文件上传限制

- 最大文件大小：5MB
- 允许的文件类型：jpg, jpeg, png, gif, webp

## 故障排除

### 1. 数据库连接失败

检查`.env`文件中的数据库配置是否正确。

### 2. 文件上传失败

检查`storage/uploads/`目录权限是否为755。

### 3. API返回500错误

检查错误日志：`storage/logs/php_errors.log`

### 4. 前端资源加载失败

检查构建文件是否正确上传到根目录。

## 监控和维护

### 1. 日志监控

定期检查以下日志文件：
- `storage/logs/php_errors.log`
- `storage/logs/app.log`

### 2. 性能监控

使用Hostinger提供的监控工具：
- 网站性能报告
- 数据库性能报告
- 错误日志

### 3. 备份策略

- 定期备份数据库
- 定期备份网站文件
- 使用Hostinger自动备份功能

## 更新部署

### 1. 代码更新

1. 本地更新代码
2. 重新构建前端：`npx vite build`
3. 重新打包：运行部署脚本
4. 上传新版本到Hostinger

### 2. 数据库更新

1. 导出本地数据库更改
2. 在phpMyAdmin中执行SQL更新
3. 验证数据完整性

## 联系支持

如遇到问题，请联系：
- Hostinger技术支持
- 项目开发团队
