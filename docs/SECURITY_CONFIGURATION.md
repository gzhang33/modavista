# 安全配置管理指南

## 概述

本项目已完成安全密钥和敏感配置的统一管理，所有敏感信息已迁移至 `.env` 文件，确保项目安全性和可维护性。

## 配置文件结构

```
backend/config/
├── app.php           # 主配置文件（原 backend/api/config.php）
├── env_loader.php    # 环境变量加载器
└── environment.php   # 环境适配器

.env                  # 环境变量文件（根目录）
.env.example         # 环境变量模板
```

## 安全配置内容

### 1. 数据库配置
```env
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=DreaModa
DB_PORT=3306
DB_CHARSET=utf8mb4
```

### 2. 管理员账户
```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=$2y$10$bqXiQg5/wn0zYQ3z/ToAhuBAMXhXK/7Iqmp9PkjXSBBOMeBZevYEy
```

### 3. API密钥
```env
OPENAI_API_KEY=your_openai_api_key_here
```

### 4. 安全密钥
```env
SESSION_SECRET=default_session_secret_change_me
ENCRYPTION_KEY=default_encryption_key_change_me
JWT_SECRET=your_jwt_secret_here
```

### 5. 网站配置
```env
SITE_NAME=DreaModa Fashion Collection
SITE_URL=https://dreamoda.store
FRONTEND_URL=https://dreamoda.store
API_BASE_URL=https://dreamoda.store/api
```

## 配置加载机制

### 1. 环境变量加载器 (env_loader.php)
- 自动加载 `.env` 文件
- 提供默认值机制
- 支持开发和生产环境切换

### 2. 环境适配器 (environment.php)
- 统一环境配置管理
- 提供数据库、上传、CORS等配置
- 自动应用环境相关设置

### 3. 主配置文件 (app.php)
- 集成所有配置模块
- 定义全局常量
- 提供工具函数

## 引用路径更新

所有引用已从 `backend/api/config.php` 更新为 `backend/config/app.php`：

### API文件
- `backend/api/*.php` → `require_once '../config/app.php';`

### 管理文件
- `backend/admin/*.php` → `require_once '../config/app.php';`

### 脚本文件
- `scripts/verify_config.php` → 保持原有路径（正确）

## 安全最佳实践

### 1. .env文件保护
```bash
# 确保.env文件不被提交到版本控制
echo ".env" >> .gitignore

# 设置适当的文件权限
chmod 600 .env
```

### 2. 生产环境配置
- 使用强密码和随机密钥
- 定期轮换API密钥
- 启用HTTPS和安全cookie

### 3. 配置验证
```bash
# 运行配置验证脚本
php scripts/verify_config.php
```

## 迁移完成检查清单

- [x] 扫描项目中所有安全密钥和敏感配置
- [x] 迁移敏感配置到.env文件
- [x] 验证.env文件配置完整性
- [x] 调整配置文件路径定位
- [x] 统一移动config文件到config/目录
- [x] 更新所有引用路径
- [x] 创建配置管理文档

## 注意事项

1. **生产环境部署**：确保在生产环境中正确配置所有环境变量
2. **密钥安全**：定期更新敏感密钥，不要使用默认值
3. **权限控制**：确保.env文件仅对必要用户可读
4. **备份策略**：定期备份配置文件（排除敏感信息）

## 故障排除

### 常见问题
1. **配置文件找不到**：检查路径引用是否正确
2. **环境变量未加载**：确认.env文件存在且格式正确
3. **权限错误**：检查文件权限设置

### 调试命令
```bash
# 检查配置加载
php scripts/verify_config.php

# 测试数据库连接
php backend/api/test_connection.php

# 检查环境变量
php -r "require 'backend/config/env_loader.php'; EnvLoader::load(); var_dump(getenv('DB_HOST'));"
```
