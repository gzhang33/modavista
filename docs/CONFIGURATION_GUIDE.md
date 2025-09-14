# 配置管理指南

## 概述

本项目采用环境变量配置管理方式，将所有敏感配置信息集中管理，提高安全性和可维护性。

## 配置文件结构

```
dreamoda-project/
├── .env                    # 实际环境变量配置（不纳入Git）
├── .env.example           # 环境变量配置模板
├── backend/config/
│   └── env_loader.php     # 环境变量加载器
└── docs/
    └── CONFIGURATION_GUIDE.md  # 本配置指南
```

## 环境变量配置

### 1. 创建配置文件

首次部署时，复制配置模板：

```bash
cp .env.example .env
```

### 2. 配置说明

#### 基础环境配置
```bash
APP_ENV=development          # 环境类型：development/production
APP_DEBUG=true              # 调试模式：true/false
APP_URL=http://localhost    # 应用基础URL
```

#### 数据库配置
```bash
DB_HOST=localhost           # 数据库主机
DB_USER=your_username       # 数据库用户名
DB_PASS=your_password       # 数据库密码
DB_NAME=your_database       # 数据库名称
DB_PORT=3306               # 数据库端口
DB_CHARSET=utf8mb4         # 字符集
```

#### 管理员账户配置
```bash
ADMIN_USERNAME=admin        # 管理员用户名
ADMIN_PASSWORD_HASH=...     # 管理员密码哈希
```

生成密码哈希：
```php
echo password_hash('your_password', PASSWORD_DEFAULT);
```

#### API密钥配置
```bash
OPENAI_API_KEY=sk-...      # OpenAI API密钥
```

#### 安全配置
```bash
SESSION_SECRET=...          # 会话密钥
ENCRYPTION_KEY=...          # 加密密钥
JWT_SECRET=...              # JWT密钥
```

#### 文件上传配置
```bash
UPLOAD_MAX_SIZE=5242880     # 最大上传文件大小（字节）
UPLOAD_ALLOWED_EXTS=jpg,jpeg,png,gif,webp  # 允许的文件扩展名
UPLOAD_DIR=storage/uploads  # 上传目录
```

#### 邮件配置
```bash
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=587
SMTP_USERNAME=noreply@yourdomain.com
SMTP_PASSWORD=your_email_password
CONTACT_EMAIL=contact@yourdomain.com
```

#### CORS配置
```bash
CORS_ALLOWED_ORIGINS=https://yourdomain.com,http://localhost:5173
CORS_ALLOWED_METHODS=GET,POST,PUT,DELETE,OPTIONS
CORS_ALLOWED_HEADERS=Content-Type,Authorization,X-Requested-With
```

## 使用方法

### 1. 在PHP代码中读取环境变量

```php
// 加载环境变量
require_once __DIR__ . '/config/env_loader.php';
EnvLoader::load();

// 读取配置
$dbHost = EnvLoader::get('DB_HOST', 'localhost');
$apiKey = EnvLoader::get('OPENAI_API_KEY');
$isProduction = EnvLoader::isProduction();
$isDebug = EnvLoader::isDebug();
```

### 2. 环境变量加载器功能

```php
// 检查环境类型
EnvLoader::isProduction()  // 是否为生产环境
EnvLoader::isDebug()       // 是否启用调试模式

// 获取配置值
EnvLoader::get('KEY', 'default_value')  // 获取配置，支持默认值

// 获取所有配置
EnvLoader::all()  // 返回所有环境变量数组
```

## 安全注意事项

### 1. 文件权限
- `.env` 文件权限设置为 600（仅所有者可读写）
- 确保Web服务器无法直接访问 `.env` 文件

### 2. 版本控制
- `.env` 文件已加入 `.gitignore`，不会提交到版本控制
- 使用 `.env.example` 作为配置模板

### 3. 生产环境部署
```bash
# 设置文件权限
chmod 600 .env

# 验证配置
php -r "require_once 'backend/config/env_loader.php'; EnvLoader::load(); var_dump(EnvLoader::isProduction());"
```

## 环境切换

### 开发环境
```bash
APP_ENV=development
APP_DEBUG=true
DB_HOST=localhost
DB_USER=root
DB_PASS=
```

### 生产环境
```bash
APP_ENV=production
APP_DEBUG=false
DB_HOST=localhost
DB_USER=u123456789_dreamoda
DB_PASS=your_production_password
```

## 故障排除

### 1. 配置未生效
- 检查 `.env` 文件是否存在
- 确认环境变量加载器已正确引入
- 验证文件权限

### 2. 数据库连接失败
- 检查数据库配置是否正确
- 确认数据库服务是否启动
- 验证用户权限

### 3. API密钥问题
- 确认API密钥格式正确
- 检查网络连接
- 验证API配额

## 配置验证

使用以下脚本验证配置：

```php
<?php
require_once 'backend/config/env_loader.php';
EnvLoader::load();

echo "Environment: " . EnvLoader::get('APP_ENV') . "\n";
echo "Debug Mode: " . (EnvLoader::isDebug() ? 'ON' : 'OFF') . "\n";
echo "Database Host: " . EnvLoader::get('DB_HOST') . "\n";
echo "Site URL: " . EnvLoader::get('SITE_URL') . "\n";
?>
```

## 最佳实践

1. **敏感信息分离**: 所有敏感配置都通过环境变量管理
2. **环境隔离**: 开发、测试、生产环境使用不同的配置文件
3. **默认值**: 为所有配置提供合理的默认值
4. **验证机制**: 在应用启动时验证关键配置
5. **日志记录**: 记录配置加载状态（不记录敏感值）
