# Hostinger 部署与迁移手册（DreaModa.store）

本地使用 XAMPP 测试，通过"复制文件 + 导入数据库"的方式部署到 Hostinger。

## 目录结构（纯PHP项目）
- /api                      # PHP API接口
- /assets                   # 前端静态资源
- /admin                    # 管理后台
- /images                   # 上传图片存储
- /index.html, /product.html # 前端展示页面

## 一、本地准备（仅一次）
- 数据库配置：
  - DB: products / root / 空密码 / localhost
  - 确认以下 URL 正常：
    - http://localhost/index.html
    - http://localhost/api/products.php
    - http://localhost/admin/login.html

## 二、导出数据库（每次上线前）
- 方式 A（提供脚本）
  1) 运行 PowerShell：`tools/export_db.ps1`，生成 `dist/products-YYYYMMDD-HHMMSS.sql`
- 方式 B（phpMyAdmin）
  1) 打开 phpMyAdmin → 选择数据库 `products` → 导出 → 快速 → SQL → 下载 `products.sql`。

## 三、打包文件（每次上线）
- 运行 PowerShell：`tools/pack_for_hostinger.ps1`
  - 自动打包：`api/`, `assets/`, `admin/`, `images/`, `index.html`, `product.html`, 根 `.htaccess`、本手册
  - 产物：`dist/deploy-DreaModa.store-YYYYMMDD-HHMMSS.zip`

## 四、上传与解压（每次上线）
1) Hostinger File Manager：上传 `dist/deploy-*.zip` 至 `public_html/` 并解压。
2) 上传数据库文件（SQL）以便导入。
3) 确保目录可写：`public_html/images/`（一般 755 即可）。

## 五、创建并导入数据库（首次或需要重建时）
1) hPanel → Databases → MySQL Databases：新建 DB、User，并记录：
   - DB_NAME / DB_USER / DB_PASSWORD / DB_HOST（Hostinger 提供）
2) 导入：hPanel → phpMyAdmin → 选择新库 → Import → 选择 SQL 文件 → 执行。

## 六、配置生产环境（首次）
1) 编辑 `public_html/api/config.php`：
   ```php
   define('DB_NAME', '你的库名');
   define('DB_USER', '你的用户名');
   define('DB_PASSWORD', '你的密码');
   define('DB_HOST', 'Hostinger提供的MySQL主机');
   ```

## 七、验证
- https://DreaModa.store/ 前端展示正常加载
- https://DreaModa.store/api/products.php 正常返回（空数组也算 OK）
- https://DreaModa.store/admin/login.html 管理后台可登录
- 图片上传落到 `public_html/images/`

## 八、常见问题
- 仅拷贝文件会丢失数据：务必导出/导入数据库
- 数据库连接失败：检查 `api/config.php` 中的数据库配置
- 图片上传失败：检查 `public_html/images/` 目录权限
- API 404错误：检查 `public_html/.htaccess` 文件是否存在

## 九、回滚
- 上线前备份：下载 `public_html/` 全部文件 + 导出数据库
- 故障：还原备份；或仅回滚 `api/config.php` 与 `.htaccess`

## 十、.htaccess 配置
创建根目录 `.htaccess` 文件：
```apache
RewriteEngine On

# API路由
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^api/(.*)$ api/$1 [L]

# 管理后台路由
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^admin/(.*)$ admin/$1 [L]

# 默认首页
DirectoryIndex index.html
```