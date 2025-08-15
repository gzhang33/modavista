# Hostinger 部署与迁移手册（DreaModa.store）

本地使用 XAMPP 测试，通过“复制文件 + 导入数据库”的方式部署到 Hostinger。

## 目录结构（保持不变）
- /api
- /assets
- /admin
- /images
- /wp  (WordPress 在子目录)
- /index.html, /product.html

## 一、本地准备（仅一次）
- 已内置环境自动识别：`wp/wp-config.php` 会根据 `HTTP_HOST` 切换本地/生产配置。
- 本地常量：
  - DB: wordpress / root / 空密码 / localhost
  - WP_HOME / WP_SITEURL = http://localhost/wp
  - UPLOADS = ../images（媒体统一到根 images）
  - FS_METHOD = direct（允许后台直接写入）
- 固定链接：本地后台保存“固定链接”一次（Settings → Permalinks → Save）。
- 确认以下 URL 正常：
  - http://localhost/wp/wp-admin
  - http://localhost/wp/wp-json/b2b/v1/products

## 二、导出数据库（每次上线前）
- 方式 A（提供脚本）
  1) 运行 PowerShell：`tools/export_db.ps1`，生成 `dist/wordpress-YYYYMMDD-HHMMSS.sql`
- 方式 B（phpMyAdmin）
  1) 打开 phpMyAdmin → 选择数据库 `wordpress` → 导出 → 快速 → SQL → 下载 `wordpress.sql`。

## 三、打包文件（每次上线）
- 运行 PowerShell：`tools/pack_for_hostinger.ps1`
  - 自动打包：`api/`, `assets/`, `admin/`, `images/`, `wp/`, `index.html`, `product.html`, 根 `.htaccess` 与 `wp/.htaccess`、本手册
  - 产物：`dist/deploy-DreaModa.store-YYYYMMDD-HHMMSS.zip`

## 四、上传与解压（每次上线）
1) Hostinger File Manager：上传 `dist/deploy-*.zip` 至 `public_html/` 并解压。
2) 上传数据库文件（SQL）以便导入。
3) 确保目录可写：`public_html/images/`, `public_html/wp/wp-content/`（一般 755 即可）。

## 五、创建并导入数据库（首次或需要重建时）
1) hPanel → Databases → MySQL Databases：新建 DB、User，并记录：
   - DB_NAME / DB_USER / DB_PASSWORD / DB_HOST（Hostinger 提供）
2) 导入：hPanel → phpMyAdmin → 选择新库 → Import → 选择 SQL 文件 → 执行。

## 六、配置生产环境（首次）
1) 编辑 `public_html/wp/wp-config.php`：在生产分支替换占位符：
   - DB_NAME=你的库名
   - DB_USER=你的用户名
   - DB_PASSWORD=你的密码
   - DB_HOST=Hostinger 提供的 MySQL 主机
   - WP_HOME / WP_SITEURL = https://DreaModa.store/wp（已预设）
2) 后台 → Settings → Permalinks → Save（让重写规则落地）。
3) 域名与内容链接替换：安装 “Better Search Replace” 插件，执行：
   - Search for: http://localhost/wp
   - Replace with: https://DreaModa.store/wp
   - 先 Dry Run，确认记录数量，再执行实际替换。

## 七、验证
- https://DreaModa.store/wp/wp-admin 可登录。
- https://DreaModa.store/wp/wp-json/b2b/v1/products 正常返回（空数组也算 OK）。
- 后台安装/更新插件成功（失败多为目录权限或 FS_METHOD 问题）。
- 媒体上传落到 `public_html/images/`。

## 八、常见问题
- 仅拷贝文件会丢失插件配置/内容：务必导出/导入数据库。
- 表前缀不一致导致“数据丢失”：确保 `wp-config.php` 的 `$table_prefix` 与导入库一致（默认 `wp_`）。
- 登录失败：清 Cookie/无痕测试；检查 `WP_HOME`/`WP_SITEURL` 域名；必要时用一次性 MU 插件重置密码。
- 404 或接口不通：检查 `public_html/.htaccess` 与 `public_html/wp/.htaccess` 是否存在且有效；保存一次固定链接。
- 自动更新提示 FTP：保持 `FS_METHOD=direct`；不行则用 File Manager 手动上传解压插件。

## 九、回滚
- 上线前备份：下载 `public_html/` 全部文件 + 导出数据库。
- 故障：还原备份；或仅回滚 `wp/wp-config.php` 与 `.htaccess`。



