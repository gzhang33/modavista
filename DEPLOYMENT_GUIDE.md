# DreaModa Hostinger 部署指南

## 项目概述
本项目已成功改造为 React 前端 + PHP 后端的前后端分离架构，适用于 Hostinger 共享主机部署。

## 部署架构
- **前端**: React 18 + TypeScript + Vite 构建的静态文件
- **后端**: 现有 DreaModa PHP API
- **数据库**: MySQL 8.0 (Hostinger 提供)
- **部署方式**: 静态文件上传到 public_html 目录

## 部署步骤

### 1. 前端部署

#### 1.1 本地构建
```bash
# 在 SampleShowcase 目录下执行
npm run build
```
构建完成后，`dist` 目录包含所有静态文件：
- `index.html` - 主页面
- `assets/` - CSS、JS、字体等资源文件
- `.htaccess` - Apache 配置文件

#### 1.2 上传到 Hostinger
1. 登录 Hostinger 控制面板
2. 进入 "文件管理器" 或使用 FTP 客户端
3. 导航到 `public_html` 目录
4. 将 `dist` 目录下的**所有文件**上传到 `public_html` 根目录
   ```
   public_html/
   ├── index.html
   ├── .htaccess
   └── assets/
       ├── index-coyrtzvc.js
       ├── index-qPTe7arC.css
       ├── ui-OUkdqOOm.js
       └── vendor-CX2mysxk.js
   ```

### 2. PHP API 配置

#### 2.1 创建 API 目录
在 `public_html` 目录下创建 `api` 文件夹：
```
public_html/
├── api/          <- 新建此目录
├── index.html
├── .htaccess
└── assets/
```

#### 2.2 部署 DreaModa PHP API
将现有的 DreaModa PHP API 文件放入 `api` 目录：
```
public_html/api/
├── index.php           <- 主要 API 入口
├── config/
│   └── database.php    <- 数据库配置
├── endpoints/
│   ├── products.php    <- 产品 API
│   └── inquiries.php   <- 询价 API
└── .htaccess          <- API 路由配置
```

#### 2.3 API .htaccess 配置
在 `public_html/api/` 目录创建 `.htaccess`：
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.php [QSA,L]
```

### 3. 数据库配置

#### 3.1 创建数据库
1. 在 Hostinger 控制面板中创建 MySQL 数据库
2. 记录数据库连接信息：
   - 数据库名称
   - 用户名
   - 密码
   - 主机地址

#### 3.2 更新 PHP 配置
在 `public_html/api/config/database.php` 中配置数据库连接：
```php
<?php
$host = 'localhost'; // 或 Hostinger 提供的主机地址
$dbname = 'your_database_name';
$username = 'your_database_user';
$password = 'your_database_password';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    die("数据库连接失败: " . $e->getMessage());
}
?>
```

### 4. 验证部署

#### 4.1 前端验证
访问您的域名 (例如: `https://yourdomain.com`)，应该看到 DreaModa 主页面。

#### 4.2 API 验证
测试 API 端点：
- `https://yourdomain.com/api/products` - 获取产品列表
- `https://yourdomain.com/api/inquiries` - 提交询价

#### 4.3 SPA 路由验证
测试前端路由：
- `https://yourdomain.com/products` - 产品页面
- 刷新页面应该正常显示，不会出现 404 错误

## 常见问题解决

### 1. 404 错误
**问题**: 刷新页面时出现 404 错误
**解决**: 确保 `.htaccess` 文件已正确上传到 `public_html` 根目录

### 2. API 无法访问
**问题**: `/api/*` 请求返回 404
**解决**: 
1. 确保 `api` 目录存在于 `public_html` 下
2. 检查 API 目录下的 `.htaccess` 配置
3. 验证 PHP 文件权限设置为 644

### 3. 样式丢失
**问题**: 页面显示但样式丢失
**解决**: 
1. 确保 `assets` 目录完整上传
2. 检查文件权限设置
3. 验证 `.htaccess` 中的 MIME 类型配置

### 4. 数据库连接失败
**问题**: API 返回数据库连接错误
**解决**:
1. 确认数据库凭据正确
2. 检查 Hostinger 数据库主机地址
3. 确保数据库用户有足够权限

## 性能优化建议

### 1. 启用 Gzip 压缩
`.htaccess` 已包含 Gzip 配置，可减少传输大小 60-80%

### 2. 设置缓存策略
- 静态资源缓存 1 年
- HTML 文件不缓存，确保更新及时生效

### 3. 图片优化
建议使用 WebP 格式图片，并提供 JPEG/PNG 后备

### 4. CDN 配置 (可选)
考虑使用 Hostinger 提供的 CDN 服务加速全球访问

## 更新流程

### 前端更新
1. 本地修改代码
2. 执行 `npm run build`
3. 将 `dist` 目录内容重新上传到 `public_html`

### API 更新
1. 修改 PHP 代码
2. 将更新的文件上传到 `public_html/api/`
3. 清除相关缓存

## 监控和维护

### 1. 错误日志
- 查看 Hostinger 控制面板中的错误日志
- 监控 API 响应时间和错误率

### 2. 备份
- 定期备份数据库
- 备份重要的配置文件

### 3. 安全更新
- 定期更新 PHP 版本
- 监控安全漏洞并及时修复

## 联系支持
如果遇到部署问题，可以联系：
1. Hostinger 技术支持
2. 查看项目文档和 README
3. 检查 GitHub Issues

---
部署完成后，您的 DreaModa 项目将以现代化的前后端分离架构运行在 Hostinger 共享主机上，具备良好的性能和可维护性。