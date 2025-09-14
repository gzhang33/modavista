# Dreamoda 多环境部署指南

## 概述

本项目已实现同一套代码同时适配本地开发环境和线上生产环境（Hostinger）的功能。通过智能环境检测和配置文件管理，实现无缝环境切换。

## 环境架构

### 1. 自动环境检测
- **开发环境**: localhost, 127.0.0.1, ::1
- **生产环境**: dreamoda.store, www.dreamoda.store 或其他非本地域名

### 2. 配置管理
- **.env文件**: 存储所有环境变量和敏感配置
- **环境适配器**: 自动根据环境加载对应配置
- **智能切换**: 无需手动修改代码，自动适配环境

## 部署步骤

### 1. 本地开发环境部署

#### 1.1 配置.env文件
```bash
# 确保.env文件包含开发环境配置
APP_ENV=development
APP_DEBUG=true

# 数据库配置 - 开发环境
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=DreaModa
DB_PORT=3306
```

#### 1.2 启动开发环境
```bash
# 测试配置
php scripts/test_environment.php

# 启动前端开发服务器
cd frontend
npm install
npm run dev
```

### 2. 生产环境部署（Hostinger）

#### 2.1 上传代码
```bash
# 使用部署脚本打包
.\scripts\deploy\pack_for_hostinger.ps1

# 上传到Hostinger服务器
```

#### 2.2 配置生产环境
在生产服务器上创建.env文件：
```env
APP_ENV=production
APP_DEBUG=false

# 数据库配置 - 生产环境
DB_HOST_PROD=localhost
DB_USER_PROD=u705464511_gianni
DB_PASS_PROD=V2[qfN+;;5+2
DB_NAME_PROD=u705464511_Dreamoda
DB_PORT_PROD=3306

# 网站配置 - 生产环境
SITE_URL_PROD=https://dreamoda.store
FRONTEND_URL_PROD=https://dreamoda.store
API_BASE_URL_PROD=https://dreamoda.store/backend/api

# 安全配置
SESSION_SECRET=your_secure_session_secret
ENCRYPTION_KEY=your_secure_encryption_key
```

#### 2.3 验证部署
```bash
# 测试生产环境配置
php scripts/test_environment.php

# 检查数据库连接
php backend/api/test_connection.php
```

## 环境切换

### 自动切换
系统会自动根据HTTP_HOST检测环境：
- `localhost` → 开发环境
- `dreamoda.store` → 生产环境

### 手动切换
```bash
# 切换到开发环境
php scripts/switch_environment.php development

# 切换到生产环境
php scripts/switch_environment.php production
```

## 配置文件结构

```
backend/config/
├── app.php                    # 主配置文件
├── env_loader.php            # 环境变量加载器
├── environment_adapter.php   # 环境适配器
└── environment.php           # 旧版环境配置（保留）

.env                          # 环境变量文件
.env.example                 # 环境变量模板
```

## 环境特定配置

### 开发环境特性
- 错误显示开启
- 本地数据库连接
- 宽松CORS策略
- 调试日志详细

### 生产环境特性
- 错误显示关闭
- Hostinger数据库连接
- 严格CORS策略
- 安全会话配置

## 故障排除

### 1. 环境检测问题
```bash
# 检查当前环境
php -r "
require 'backend/config/env_loader.php';
EnvLoader::load();
echo 'Environment: ' . (EnvLoader::isProduction() ? 'Production' : 'Development') . PHP_EOL;
echo 'HTTP_HOST: ' . ($_SERVER['HTTP_HOST'] ?? 'Not set') . PHP_EOL;
"
```

### 2. 数据库连接问题
```bash
# 测试数据库连接
php scripts/test_environment.php
```

### 3. 配置加载问题
```bash
# 验证配置完整性
php scripts/verify_config.php
```

## 安全注意事项

### 1. .env文件保护
- 确保.env文件不被提交到版本控制
- 设置适当的文件权限（600）
- 定期轮换敏感密钥

### 2. 生产环境安全
- 使用强密码和随机密钥
- 启用HTTPS和安全cookie
- 限制错误信息显示

## 部署检查清单

### 开发环境
- [ ] .env文件配置正确
- [ ] 数据库连接正常
- [ ] 前端开发服务器启动
- [ ] API接口响应正常

### 生产环境
- [ ] .env文件包含生产配置
- [ ] 数据库连接使用生产凭据
- [ ] HTTPS证书配置
- [ ] 错误日志记录正常
- [ ] 文件上传功能正常
- [ ] CORS策略配置正确

## 维护建议

1. **定期备份**: 定期备份.env文件和数据库
2. **监控日志**: 监控生产环境错误日志
3. **安全更新**: 定期更新依赖和安全补丁
4. **性能优化**: 监控生产环境性能指标

## 技术支持

如遇到部署问题，请：
1. 检查环境检测日志
2. 验证配置文件完整性
3. 测试数据库连接
4. 查看错误日志文件

---

**注意**: 本指南基于Hostinger生产环境配置，其他主机服务商可能需要调整相应的配置参数。
