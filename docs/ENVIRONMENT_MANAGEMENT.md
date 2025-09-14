# 环境管理指南

## 概述

本项目采用统一的环境管理机制，确保本地开发与线上生产环境的配置一致性和可维护性。

## 架构设计

### 配置层级结构
```
环境管理架构
├── 环境变量 (.env)          # 敏感配置信息
├── 环境适配器 (environment.php)  # 环境检测和适配
├── 统一配置 (config.php)    # 主配置文件
└── 验证脚本 (verify_config.php) # 配置验证
```

### 核心组件

1. **EnvLoader**: 环境变量加载器
2. **EnvironmentAdapter**: 环境适配器
3. **统一配置**: 合并后的主配置文件
4. **验证脚本**: 配置一致性检查

## 环境配置

### 开发环境配置
```bash
# .env 开发环境配置
APP_ENV=development
APP_DEBUG=true
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=DreaModa
```

### 生产环境配置
```bash
# .env 生产环境配置
APP_ENV=production
APP_DEBUG=false
DB_HOST=localhost
DB_USER=u123456789_dreamoda
DB_PASS=your_production_password
DB_NAME=u123456789_dreamoda
```

## 使用方法

### 1. 初始化配置
```bash
# 复制配置模板
cp .env.example .env

# 编辑配置文件
nano .env
```

### 2. 验证配置
```bash
# 运行配置验证脚本
php scripts/verify_config.php
```

### 3. 在代码中使用
```php
// 获取环境适配器
$env = getEnvironment();

// 检查环境
if ($env->isDevelopment()) {
    // 开发环境逻辑
} elseif ($env->isProduction()) {
    // 生产环境逻辑
}

// 获取配置
$dbConfig = $env->getDatabaseConfig();
$uploadConfig = $env->getUploadConfig();
$corsConfig = $env->getCorsConfig();
```

## 配置合并说明

### 已合并的文件
1. **backend/api/config.php** - 主配置文件
   - 合并了原有的 config.php
   - 合并了 session_config.php 的会话管理功能
   - 合并了 hostinger_config.php 的生产环境配置

2. **backend/config/environment.php** - 环境适配器
   - 环境检测和配置管理
   - 开发/生产环境差异处理
   - 统一的配置接口

3. **backend/config/env_loader.php** - 环境变量加载器
   - .env 文件解析
   - 环境变量管理
   - 默认值处理

### 已删除的冗余文件
- `backend/api/session_config.php` - 功能已合并到主配置
- `backend/config/hostinger_config.php` - 功能已合并到主配置

## 环境差异处理

### 自动环境检测
```php
// 环境检测优先级
1. APP_ENV 环境变量
2. HTTP_HOST 判断
3. 默认生产环境
```

### 开发环境特性
- 启用详细错误报告
- 允许 localhost CORS
- 禁用会话安全Cookie
- 启用调试日志

### 生产环境特性
- 关闭错误显示
- 启用会话安全Cookie
- 限制CORS来源
- 启用缓存

## 部署流程

### 1. 本地开发部署
```bash
# 1. 克隆项目
git clone <repository>
cd dreamoda-project

# 2. 配置环境
cp .env.example .env
# 编辑 .env 文件

# 3. 验证配置
php scripts/verify_config.php

# 4. 启动开发服务器
npm run dev
```

### 2. 生产环境部署
```bash
# 1. 上传项目文件

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env 文件，设置生产环境配置

# 3. 设置文件权限
chmod 600 .env

# 4. 验证配置
php scripts/verify_config.php

# 5. 配置Web服务器
# 确保 .htaccess 规则正确
```

## 配置验证

### 自动验证项目
- ✅ 数据库连接
- ✅ 上传目录存在性
- ✅ 日志目录存在性
- ✅ 必需环境变量
- ✅ API密钥配置

### 验证脚本输出示例
```
=== Dreamoda 配置验证脚本 ===

当前环境: development
是否为开发环境: 是
是否为生产环境: 否

=== 数据库配置 ===
host: localhost
user: root
pass: (空)
name: DreaModa
port: 3306
charset: utf8mb4

测试数据库连接...
✅ 数据库连接成功
```

## 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查数据库服务是否启动
   - 验证 .env 中的数据库配置
   - 确认用户权限

2. **上传功能异常**
   - 检查上传目录权限
   - 验证文件大小限制
   - 确认允许的文件类型

3. **CORS问题**
   - 检查允许的来源配置
   - 验证前端URL设置
   - 确认环境检测正确

4. **会话问题**
   - 检查会话目录权限
   - 验证Cookie设置
   - 确认环境配置正确

### 调试方法
```php
// 获取环境信息
$envInfo = getEnvironment()->getEnvironmentInfo();
var_dump($envInfo);

// 检查配置值
echo EnvLoader::get('DB_HOST');
echo EnvLoader::get('APP_ENV');
```

## 最佳实践

1. **安全性**
   - 永远不要提交 .env 文件
   - 使用强密码和密钥
   - 定期轮换敏感配置

2. **一致性**
   - 开发和生产环境使用相同的配置结构
   - 通过环境变量区分差异
   - 使用验证脚本确保配置正确

3. **维护性**
   - 集中管理所有配置
   - 提供清晰的配置文档
   - 使用有意义的配置名称

4. **可扩展性**
   - 新环境只需添加环境变量
   - 配置逻辑与业务逻辑分离
   - 支持配置的动态加载

## 相关文档

- [配置管理指南](CONFIGURATION_GUIDE.md)
- [API接口规范](api_specification.md)
- [架构设计文档](architecture.md)
- [开发环境指南](DEV_GUIDE.md)
