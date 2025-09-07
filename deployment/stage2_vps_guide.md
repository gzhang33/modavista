# 阶段2部署 - Hostinger VPS全栈部署说明

## 📋 部署前准备清单

### 1. Hostinger VPS准备
- [ ] 购买Hostinger VPS方案（推荐KVM 2或更高配置）
- [ ] 选择Ubuntu 22.04 LTS操作系统
- [ ] 获取VPS服务器IP地址和root访问权限
- [ ] 配置域名DNS解析到VPS IP

### 2. 本地环境准备
- [ ] 安装SSH客户端（Windows用户可使用PuTTY或Windows Terminal）
- [ ] 准备FTP/SFTP客户端（如FileZilla）
- [ ] 确保项目文件完整性

### 3. 域名和SSL
- [ ] 域名已解析到VPS IP
- [ ] 准备SSL证书（可使用Let's Encrypt免费证书）

---

## 🚀 VPS服务器初始配置

### 步骤1：连接到VPS服务器

```bash
# 通过SSH连接到VPS（替换为实际IP地址）
ssh root@YOUR_VPS_IP

# 更新系统包
apt update && apt upgrade -y

# 安装基本工具
apt install -y curl wget git unzip nano htop
```

### 步骤2：安装LAMP技术栈

#### 2.1 安装Apache2
```bash
# 安装Apache
apt install -y apache2

# 启用必要模块
a2enmod rewrite
a2enmod ssl
a2enmod headers

# 启动并启用Apache
systemctl start apache2
systemctl enable apache2
```

#### 2.2 安装MySQL 8.0
```bash
# 安装MySQL服务器
apt install -y mysql-server

# 安全配置MySQL
mysql_secure_installation

# 创建DreaModa数据库和用户
mysql -u root -p << EOF
CREATE DATABASE DreaModa CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'dreamoda'@'localhost' IDENTIFIED BY 'SecurePassword123!';
GRANT ALL PRIVILEGES ON DreaModa.* TO 'dreamoda'@'localhost';
FLUSH PRIVILEGES;
EXIT;
EOF
```

#### 2.3 安装PHP 8.3
```bash
# 添加PHP仓库
add-apt-repository ppa:ondrej/php -y
apt update

# 安装PHP 8.3及必要扩展
apt install -y php8.3 php8.3-mysql php8.3-curl php8.3-gd php8.3-mbstring \
               php8.3-xml php8.3-zip php8.3-json php8.3-opcache libapache2-mod-php8.3

# 重启Apache
systemctl restart apache2
```

### 步骤3：安装Node.js环境

#### 3.1 安装Node.js 20 LTS
```bash
# 安装NodeSource仓库
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# 安装Node.js
apt install -y nodejs

# 验证安装
node --version
npm --version
```

#### 3.2 安装PM2进程管理器
```bash
# 安装PM2全局
npm install -g pm2

# 设置PM2开机自启
pm2 startup
pm2 save
```

---

## 📁 项目部署配置

### 步骤4：部署DreaModa主项目

#### 4.1 配置Apache虚拟主机
创建配置文件：
```bash
nano /etc/apache2/sites-available/dreamoda.conf
```

添加以下内容：
```apache
<VirtualHost *:80>
    ServerName yourdomain.com
    ServerAlias www.yourdomain.com
    DocumentRoot /var/www/dreamoda
    
    <Directory /var/www/dreamoda>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    
    # 错误和访问日志
    ErrorLog ${APACHE_LOG_DIR}/dreamoda_error.log
    CustomLog ${APACHE_LOG_DIR}/dreamoda_access.log combined
    
    # PHP配置
    php_admin_value upload_max_filesize 10M
    php_admin_value post_max_size 10M
    php_admin_value memory_limit 256M
    
    # 安全头设置
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options DENY
    Header always set X-XSS-Protection "1; mode=block"
</VirtualHost>

# HTTPS重定向
<VirtualHost *:443>
    ServerName yourdomain.com
    ServerAlias www.yourdomain.com
    DocumentRoot /var/www/dreamoda
    
    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/yourdomain.com/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/yourdomain.com/privkey.pem
    
    <Directory /var/www/dreamoda>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    
    ErrorLog ${APACHE_LOG_DIR}/dreamoda_ssl_error.log
    CustomLog ${APACHE_LOG_DIR}/dreamoda_ssl_access.log combined
</VirtualHost>
```

#### 4.2 启用站点
```bash
# 启用站点配置
a2ensite dreamoda.conf

# 禁用默认站点
a2dissite 000-default

# 重新加载Apache配置
systemctl reload apache2
```

#### 4.3 上传DreaModa文件
```bash
# 创建网站目录
mkdir -p /var/www/dreamoda

# 设置权限
chown -R www-data:www-data /var/www/dreamoda
chmod -R 755 /var/www/dreamoda
```

使用SFTP或rsync上传文件：
```bash
# 使用rsync从本地上传（在本地运行）
rsync -avz --exclude 'SampleShowcase' /path/to/your/dreamoda/ root@YOUR_VPS_IP:/var/www/dreamoda/

# 或者手动上传主要文件
# - api/
# - admin/
# - assets/
# - config/
# - images/
# - index.html
# - product.html
# - .htaccess
```

#### 4.4 配置数据库
```bash
# 导入数据库结构
mysql -u dreamoda -p DreaModa < /var/www/dreamoda/database/init_dreamoda.sql

# 更新配置文件
nano /var/www/dreamoda/api/config.php
```

更新配置内容：
```php
<?php
// 生产环境数据库配置
define('DB_HOST', 'localhost');
define('DB_USER', 'dreamoda');
define('DB_PASS', 'SecurePassword123!');
define('DB_NAME', 'DreaModa');

// 其他配置...
define('SITE_URL', 'https://yourdomain.com');
?>
```

### 步骤5：部署SampleShowcase React应用

#### 5.1 上传React项目
```bash
# 创建React应用目录
mkdir -p /opt/sampleshowcase
cd /opt/sampleshowcase

# 上传项目文件（使用git或直接上传）
git clone https://github.com/yourusername/sampleshowcase.git .
# 或者使用SFTP上传SampleShowcase文件夹内容
```

#### 5.2 安装依赖并构建
```bash
cd /opt/sampleshowcase

# 安装依赖
npm install

# 创建环境配置
nano .env
```

添加环境变量：
```env
# .env
NODE_ENV=production
PORT=3000
DATABASE_URL=mysql://dreamoda:SecurePassword123!@localhost:3306/DreaModa

# 其他配置
VITE_API_URL=https://yourdomain.com/api
```

#### 5.3 构建生产版本
```bash
# 构建应用
npm run build

# 构建服务器端
npm run build
```

#### 5.4 配置PM2运行React应用
创建PM2配置文件：
```bash
nano ecosystem.config.js
```

添加配置：
```javascript
module.exports = {
  apps: [{
    name: 'sampleshowcase',
    script: 'dist/index.js',
    cwd: '/opt/sampleshowcase',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      DATABASE_URL: 'mysql://dreamoda:SecurePassword123!@localhost:3306/DreaModa'
    },
    error_file: '/var/log/sampleshowcase-error.log',
    out_file: '/var/log/sampleshowcase-out.log',
    log_file: '/var/log/sampleshowcase.log',
    time: true
  }]
};
```

启动应用：
```bash
# 启动React应用
pm2 start ecosystem.config.js

# 保存PM2配置
pm2 save

# 查看运行状态
pm2 status
```

### 步骤6：配置反向代理

#### 6.1 为React应用配置Apache反向代理
编辑Apache配置：
```bash
nano /etc/apache2/sites-available/dreamoda.conf
```

添加反向代理配置：
```apache
# 在<VirtualHost *:443>内添加

# 启用代理模块
LoadModule proxy_module modules/mod_proxy.so
LoadModule proxy_http_module modules/mod_proxy_http.so

# React应用代理
ProxyPreserveHost On
ProxyPass /app/ http://localhost:3000/
ProxyPassReverse /app/ http://localhost:3000/

# API保持原有路由
ProxyPass /api/ !
```

启用代理模块：
```bash
a2enmod proxy
a2enmod proxy_http
systemctl restart apache2
```

---

## 🔒 SSL证书配置

### 安装Let's Encrypt证书
```bash
# 安装Certbot
apt install -y certbot python3-certbot-apache

# 获取SSL证书
certbot --apache -d yourdomain.com -d www.yourdomain.com

# 设置自动续期
crontab -e
# 添加以下行：
# 0 12 * * * /usr/bin/certbot renew --quiet
```

---

## ✅ 部署后验证

### 1. 功能测试
访问以下URL验证：

- **主站**：`https://yourdomain.com/`
- **React应用**：`https://yourdomain.com/app/`
- **API测试**：`https://yourdomain.com/api/products`
- **管理后台**：`https://yourdomain.com/admin/dashboard.php`

### 2. 性能检查
```bash
# 检查Apache状态
systemctl status apache2

# 检查MySQL状态
systemctl status mysql

# 检查PM2应用状态
pm2 status

# 检查系统资源
htop
```

### 3. 日志监控
```bash
# Apache错误日志
tail -f /var/log/apache2/dreamoda_error.log

# React应用日志
pm2 logs sampleshowcase

# MySQL错误日志
tail -f /var/log/mysql/error.log
```

---

## 📊 监控和维护

### 1. 设置监控
```bash
# 安装系统监控工具
apt install -y htop iotop nethogs

# 设置日志轮转
nano /etc/logrotate.d/dreamoda
```

### 2. 备份脚本
```bash
# 创建备份脚本
nano /opt/backup.sh
```

添加备份脚本内容：
```bash
#!/bin/bash
# DreaModa备份脚本

BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# 创建备份目录
mkdir -p $BACKUP_DIR

# 数据库备份
mysqldump -u dreamoda -p'SecurePassword123!' DreaModa > $BACKUP_DIR/dreamoda_db_$DATE.sql

# 文件备份
tar -czf $BACKUP_DIR/dreamoda_files_$DATE.tar.gz /var/www/dreamoda

# 删除7天前的备份
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "备份完成: $DATE"
```

设置定期备份：
```bash
chmod +x /opt/backup.sh
crontab -e
# 添加: 0 2 * * * /opt/backup.sh
```

---

## 🔧 常见问题解决

### 问题1：React应用无法启动
```bash
# 检查Node.js版本
node --version

# 检查依赖安装
cd /opt/sampleshowcase && npm ls

# 查看错误日志
pm2 logs sampleshowcase --lines 50
```

### 问题2：数据库连接失败
```bash
# 检查MySQL服务状态
systemctl status mysql

# 测试数据库连接
mysql -u dreamoda -p DreaModa

# 检查防火墙设置
ufw status
```

### 问题3：Apache配置错误
```bash
# 测试Apache配置语法
apache2ctl configtest

# 重新加载配置
systemctl reload apache2

# 查看错误日志
tail -f /var/log/apache2/error.log
```

---

## 📈 性能优化建议

### 1. 服务器优化
- 配置适当的PHP OPcache
- 启用Apache mod_expires模块
- 配置Gzip压缩
- 优化MySQL配置

### 2. 应用优化
- 压缩静态资源
- 启用CDN服务
- 优化图片大小
- 配置缓存策略

### 3. 监控工具
- 安装Netdata进行实时监控
- 配置Prometheus + Grafana（高级）
- 使用Google Analytics跟踪网站性能

---

## 🎯 部署成功后

**恭喜！您的全栈DreaModa系统已成功部署到Hostinger VPS。**

**可用访问地址：**
- 主站（PHP）：`https://yourdomain.com/`
- React应用：`https://yourdomain.com/app/`
- 管理后台：`https://yourdomain.com/admin/`

**下一步建议：**
1. 配置网站分析工具
2. 设置邮件服务
3. 优化SEO设置
4. 配置CDN加速
5. 定期安全更新

**部署时间估计：** 3-5小时（包括配置和测试）