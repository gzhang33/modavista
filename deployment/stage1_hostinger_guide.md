# 阶段1部署 - Hostinger共享主机部署说明

## 📋 部署前准备清单

### 1. Hostinger账户准备
- [ ] 购买Hostinger共享主机方案（推荐Premium或Business）
- [ ] 获取域名（或使用Hostinger免费子域名）
- [ ] 登录Hostinger hPanel控制面板

### 2. 数据库准备
- [ ] 在hPanel中创建MySQL数据库
- [ ] 记录数据库连接信息：
  - 数据库名称：`u123456789_dreamoda`
  - 用户名：`u123456789_dreamoda`
  - 密码：`[生成的密码]`
  - 主机：`localhost`

### 3. 本地文件准备
- [ ] 确保所有PHP文件使用UTF-8编码
- [ ] 检查图片路径是否正确
- [ ] 测试所有功能正常运行

---

## 🚀 步骤详细指南

### 步骤1：上传文件到服务器

#### 1.1 通过hPanel文件管理器上传
1. 登录Hostinger hPanel
2. 找到"文件管理器"
3. 进入 `public_html` 目录
4. 上传以下文件和文件夹：

```
public_html/
├── api/                    # API接口文件
├── admin/                  # 管理后台
├── assets/                 # 静态资源
├── config/                 # 配置文件
├── images/                 # 图片目录（需要写权限）
├── index.html             # 首页
├── product.html           # 产品详情页
├── .htaccess             # URL重写规则
└── health-check.php      # 健康检查
```

#### 1.2 通过FTP客户端上传（推荐）
使用FileZilla或其他FTP客户端：
- **主机**：`ftp.yourdomain.com`
- **用户名**：你的Hostinger用户名
- **密码**：你的Hostinger密码
- **端口**：21

### 步骤2：配置数据库

#### 2.1 创建数据库
1. 在hPanel中找到"MySQL数据库"
2. 创建新数据库：`u123456789_dreamoda`
3. 创建数据库用户并分配权限
4. 记录连接信息

#### 2.2 导入数据库结构
1. 进入phpMyAdmin
2. 选择刚创建的数据库
3. 点击"导入"选项卡
4. 上传 `database/init_dreamoda.sql` 文件
5. 点击"执行"完成导入

### 步骤3：配置应用

#### 3.1 修改配置文件
编辑 `config/hostinger_config.php`：

```php
// 修改数据库连接信息
define('DB_HOST', 'localhost');
define('DB_USER', 'u123456789_dreamoda');        // 替换为实际用户名
define('DB_PASS', 'YourActualPassword');          // 替换为实际密码
define('DB_NAME', 'u123456789_dreamoda');         // 替换为实际数据库名

// 修改网站URL
define('SITE_URL', 'https://yourdomain.com');     // 替换为实际域名
```

#### 3.2 更新API配置文件
将 `api/config.php` 重定向到新配置：

```php
<?php
// api/config.php - 生产环境配置

// 定义环境
define('ENVIRONMENT', 'production');

// 包含Hostinger配置
require_once dirname(__DIR__) . '/config/hostinger_config.php';
?>
```

### 步骤4：设置文件权限

通过文件管理器或FTP设置以下权限：
```bash
images/          # 755 或 777 (可写)
config/          # 644 (只读)
api/            # 644 (只读)
logs/           # 755 (可写，用于错误日志)
```

### 步骤5：配置URL重写

确保 `.htaccess` 文件内容正确：

```apache
# DreaModa URL重写规则
RewriteEngine On

# 安全设置
ServerSignature Off
Options -Indexes

# 强制HTTPS（可选）
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# API路由
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^api/(.+)$ api/$1.php [L,QSA]

# 产品详情页面路由
RewriteRule ^product/([0-9]+)/?$ product.html?id=$1 [L,QSA]

# 静态资源缓存
<FilesMatch "\.(css|js|png|jpg|jpeg|gif|webp|svg|ico)$">
    ExpiresActive On
    ExpiresDefault "access plus 1 month"
    Header append Cache-Control "public"
</FilesMatch>

# 压缩设置
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>
```

---

## ✅ 部署后验证

### 1. 基础功能测试
访问以下URL验证功能：

- **首页**：`https://yourdomain.com/`
- **健康检查**：`https://yourdomain.com/health-check.php`
- **API测试**：`https://yourdomain.com/api/categories`
- **管理后台**：`https://yourdomain.com/admin/dashboard.php`

### 2. 功能检查清单
- [ ] 首页正常显示
- [ ] 产品列表加载正常
- [ ] 产品详情页可以打开
- [ ] 图片正常显示
- [ ] 语言切换功能正常
- [ ] 联系表单可以提交
- [ ] 管理后台可以登录（用户名：admin，密码：admin123）
- [ ] 可以添加新产品
- [ ] 图片上传功能正常

### 3. 性能检查
- [ ] 页面加载速度 < 3秒
- [ ] 移动端响应式正常
- [ ] SEO元标签正确
- [ ] SSL证书正常工作

---

## 🔧 常见问题解决

### 问题1：数据库连接失败
**解决方案**：
1. 检查 `config/hostinger_config.php` 中的数据库连接信息
2. 确认数据库用户有正确权限
3. 检查Hostinger控制面板中的数据库状态

### 问题2：图片无法上传
**解决方案**：
1. 检查 `images/` 目录权限是否为755或777
2. 确认PHP上传限制：`upload_max_filesize` 和 `post_max_size`
3. 检查磁盘空间是否充足

### 问题3：404错误
**解决方案**：
1. 检查 `.htaccess` 文件是否存在
2. 确认Hostinger支持mod_rewrite
3. 验证文件路径是否正确

### 问题4：中文乱码
**解决方案**：
1. 确保所有PHP文件使用UTF-8编码
2. 检查数据库字符集为utf8mb4
3. 确认HTTP头设置正确的字符集

---

## 📞 技术支持

如果在部署过程中遇到问题：

1. **检查Hostinger知识库**：https://support.hostinger.com/
2. **联系Hostinger客服**：24/7在线支持
3. **查看错误日志**：在hPanel文件管理器中检查 `logs/php_errors.log`

---

## 🎯 部署成功后

恭喜！您的DreaModa产品展示系统已成功部署到Hostinger。

**下一步建议：**
1. **更改默认密码**：立即修改管理员密码
2. **添加产品内容**：开始上传您的产品图片和信息
3. **SEO优化**：配置Google Analytics和Search Console
4. **备份设置**：定期备份数据库和文件
5. **性能监控**：监控网站加载速度和正常运行时间

**完成时间估计：** 1-2小时（取决于网络速度和文件大小）