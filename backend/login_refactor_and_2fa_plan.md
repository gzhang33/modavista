# 后台登录系统 2FA TOTP 实施方案

**执行者:** AI Agent
**目标:** 为单管理员后台添加 TOTP 双因素认证

## 核心要求

1. **移除硬编码认证**：废除前端认证逻辑，转为后端数据库驱动
2. **添加 TOTP 2FA**：支持 Google Authenticator 等标准 TOTP 应用
3. **设备信任机制**：可信设备可跳过 2FA 验证
4. **安全存储**：TOTP 密钥加密存储，防重放攻击
5. **恢复码支持**：紧急情况下使用恢复码登录

---

## 依赖安装

```bash
composer require pragmarx/google2fa bacon/bacon-qr-code paragonie/sodium_compat
```

---

## 数据库结构（最小化设计）

**目标：仅使用 2 个表完成所有功能**

### 主表：admin
```sql
CREATE TABLE `admin` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `email` VARCHAR(254) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- 登录安全
  `last_login_at` DATETIME NULL,
  `last_login_ip` VARCHAR(45) NULL,
  `login_failed_count` INT NOT NULL DEFAULT 0,
  `locked_until` DATETIME NULL,
  
  -- 2FA 字段
  `totp_enabled` TINYINT(1) NOT NULL DEFAULT 0,
  `totp_secret_enc` VARBINARY(256) NULL,
  `totp_secret_iv` VARBINARY(16) NULL,
  `totp_secret_tag` VARBINARY(16) NULL,
  `last_totp_timestamp` BIGINT NULL,
  
  -- 设备信任（JSON 存储）
  `trusted_devices` JSON NULL,
  
  -- 恢复码（JSON 存储）
  `recovery_codes` JSON NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 审计表：admin_logs
```sql
CREATE TABLE `admin_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `admin_id` INT NULL,
  `action` VARCHAR(50) NOT NULL,
  `details` JSON NULL,
  `ip_address` VARCHAR(45) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  INDEX `idx_admin_action` (`admin_id`, `action`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## 核心文件创建

### 1. 安全工具类：`lib/SecurityHelper.php`
- TOTP 密钥加密/解密
- 设备指纹生成
- 风险评分计算
- 设备信任管理

### 2. 数据库连接：`config/database.php`
- 单例模式数据库连接
- 支持环境变量配置

### 3. 引导文件：`backend/bootstrap.php`
- 自动加载依赖
- 安全会话配置
- CSRF 令牌管理
- 设备指纹生成

### 4. 管理员创建工具：`create_admin.php`
- 一次性密码哈希生成工具
- 本地使用后删除

---

## API 端点实现

### 登录流程 API
1. **`api/login.php`** - 用户名密码验证，返回是否需要 2FA
2. **`api/verify_2fa.php`** - TOTP 验证，支持设备信任
3. **`api/verify_recovery_code.php`** - 恢复码验证
4. **`api/check_session.php`** - 会话状态检查

### 2FA 管理 API
1. **`api/generate_2fa_secret.php`** - 生成 TOTP 密钥和二维码
2. **`api/activate_2fa.php`** - 激活 2FA
3. **`api/disable_2fa.php`** - 禁用 2FA
4. **`api/regenerate_recovery_codes.php`** - 重新生成恢复码

---

## 前端页面修改

### 1. 登录页面：`admin/login.html`
- 移除硬编码用户名
- 添加 2FA 输入表单
- 添加"记住设备"选项
- 添加恢复码输入模态框

### 2. 2FA 设置页面：`admin/setup_2fa.php`
- 2FA 启用/禁用界面
- 二维码显示
- 恢复码管理
- 可信设备管理

---

## 实施步骤

### Phase 1: 基础架构（1-2 天）
1. 创建数据库表
2. 安装依赖库
3. 创建核心工具类
4. 实现基础登录 API

### Phase 2: 2FA 功能（2-3 天）
1. 实现 TOTP 生成和验证
2. 添加设备信任机制
3. 实现恢复码功能
4. 创建 2FA 管理界面

### Phase 3: 集成测试（1 天）
1. 测试完整登录流程
2. 测试设备信任功能
3. 测试恢复码功能
4. 安全测试

---

## 关键实现要点

### 安全要求
- TOTP 密钥使用 AES-GCM 加密存储
- 防重放攻击：验证 TOTP 时间戳
- 设备指纹基于 User-Agent + IP + 语言
- 恢复码使用后立即失效

### 用户体验
- 可信设备 30 天内免 2FA
- 风险评分决定是否强制 2FA
- 支持恢复码紧急登录
- 清晰的错误提示

### 数据存储
- 设备信任信息存储在 JSON 字段
- 恢复码存储在 JSON 字段
- 审计日志记录所有关键操作
- 支持数据清理和归档

---

## 测试验证

### 功能测试
- [ ] 基础登录流程
- [ ] 2FA 启用和验证
- [ ] 设备信任机制
- [ ] 恢复码功能
- [ ] 会话管理

### 安全测试
- [ ] TOTP 重放攻击防护
- [ ] 设备指纹唯一性
- [ ] 加密存储验证
- [ ] CSRF 防护
- [ ] 会话安全

### 兼容性测试
- [ ] Google Authenticator
- [ ] Microsoft Authenticator
- [ ] Authy
- [ ] 其他标准 TOTP 应用