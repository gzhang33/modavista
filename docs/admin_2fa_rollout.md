# 后台二步验证上线手册

> 目标：为 DreamModa 管理后台启用基于 TOTP 的二步验证（2FA），覆盖数据库迁移、环境配置、种子数据和上线校验步骤。

## 1. 前置依赖
- PHP CLI（>= 8.0）
- Composer（已在 `backend/` 安装依赖：`composer require pragmarx/google2fa bacon/bacon-qr-code paragonie/sodium_compat`）
- MySQL 5.7+/8.0，已启用 `utf8mb4` 字符集
- 具备管理员数据库账号与 SSH/桌面访问权限

## 2. 数据库迁移
> 脚本：`backend/scripts/migrations/20250921_admin_schema_migration.php`

1. **预检现有结构**
   ```bash
   php backend/scripts/migrations/20250921_admin_schema_migration.php --inspect
   ```
   - 输出 `admin` 与 `admin_logs` 当前结构，确认是否已存在相关字段。

2. **执行迁移**
   ```bash
   php backend/scripts/migrations/20250921_admin_schema_migration.php --apply --inspect
   ```
   - 确认以下字段存在并类型正确：
     - `admin.totp_secret_enc` / `totp_secret_iv` / `totp_secret_tag`：`VARBINARY(256/16/16)`
     - `admin.trusted_devices` / `recovery_codes`：`JSON`
     - `admin.last_totp_timestamp`：`BIGINT`
     - `admin_logs.details`：`JSON`
   - 脚本可重复执行，若字段已符合规范将跳过修改。

3. **备份建议**
   - 生产环境操作前建议使用 `mysqldump` 备份 `admin` 与 `admin_logs`。

## 3. 环境变量配置
在部署目标的 `.env` 或系统环境变量中新增/更新以下项：

| 变量 | 说明 | 示例生成方式 |
| ---- | ---- | ------------ |
| `ADMIN_PASSWORD_HASH` | 使用 `password_hash()` 生成的 bcrypt 哈希 | `php -r "echo password_hash('StrongPass!', PASSWORD_BCRYPT);"`
| `ENCRYPTION_KEY` | 32 字节以上随机字符串，用于 AES-256-GCM 加密 TOTP 密钥 | `openssl rand -hex 32`
| `SESSION_SECRET` | 会话密钥，至少 32 字节随机字符串 | `openssl rand -hex 32`
| `SITE_URL` / `API_BASE_URL` | 确认生产环境使用 `https` | - |

> ⚠️ 不要将明文管理员密码写入 `.env`，仅保存哈希；切勿提交 `.env` 至版本库。

## 4. 管理员种子数据
> 工具：`backend/scripts/seed_admin_2fa.php`

1. **演练（dry-run）**
   ```bash
   php backend/scripts/seed_admin_2fa.php --password "NewStrongPass!" --dry-run
   ```
   - 显示将写入的密码哈希、TOTP 秘钥与恢复代码，但不会修改数据库。

2. **正式执行**
   ```bash
   php backend/scripts/seed_admin_2fa.php --password "NewStrongPass!"
   ```
   - 默认以 `.env` 中的 `ADMIN_USERNAME` 为目标账号。
   - 支持可选参数：`--username`、`--secret`（自备 TOTP 秘钥）、`--codes=<数量>`。
   - 执行结果会输出：纯文本 TOTP 密钥 + 恢复代码列表，请立即妥善保存。

## 5. 后台 2FA 配置流程
1. 管理员登录后台 `backend/admin/login.html`。
2. 打开「安全设置」(`setup_2fa.php`) 页面，点击「生成绑定二维码」。
3. 使用认证器（Google Authenticator/Microsoft Authenticator/Authy 等）扫描二维码或手动输入密钥。
4. 在页面输入 6 位动态验证码完成绑定。
5. 保存展示的恢复代码；如需再次生成可在「二步验证管理」中操作。
6. 若需要停用 2FA，必须再次提供账户密码与动态验证码/恢复代码。

## 6. 登录链路验证
> 建议在上线前于浏览器完成以下场景测试，确保 Cookie 与日志均正常写入。

1. **基础流程**：密码登录 → 输入 TOTP → 成功进入后台。
2. **记住设备**：勾选「记住设备」后再次登录应跳过 TOTP，`admin.trusted_devices` 写入对应记录。
3. **恢复代码**：手动触发「使用恢复代码」，验证一次性恢复码后能成功登录且该恢复码被移除。
4. **锁定策略**：连续 5 次密码错误触发账号锁定（10 分钟），确认返回提示 `423`。
5. **失败日志**：检查 `admin_logs`，应出现 `login_failed`、`2fa_failed`、`2fa_recovery_used` 等记录。
6. **Cookie 校验**：通过开发者工具确认 2FA 通过后发放的 `admin_trusted_device` 为 `HttpOnly`/`SameSite=Lax`。

## 7. 安全注意事项
- **全站 HTTPS**：生产环境必须启用 HTTPS，`Strict-Transport-Security` 仅在生产开启。
- **CSRF 防护**：`generate_2fa_secret`、`activate_2fa`、`disable_2fa`、`regenerate_recovery_codes` 均强制校验 `csrf_token`。
- **加密存储**：TOTP 秘钥以 AES-256-GCM 加密存储，恢复代码仅保存哈希值。
- **可信设备**：只保留最近 5 台设备；后端自动清理超期 token。
- **日志留痕**：所有启用/禁用/异常验证都会写入 `admin_logs`，建议定期审计该表。
- **密钥轮换**：如需更换 `ENCRYPTION_KEY`，必须重新生成管理员 TOTP 秘钥。

## 8. 常见问题
| 问题 | 处理建议 |
| ---- | -------- |
| 403 `安全校验失败` | 刷新页面以刷新 `csrf_token`，确认请求头/体携带 token。 |
| 401 `动态验证码不正确` | 检查服务器时间同步（NTP）；确认认证器的时区设置。 |
| 423 `验证码尝试次数过多` | 在设置页面重新生成二维码或等待计数器重置。 |
| 恢复代码全部用尽 | 使用 `regenerate_recovery_codes.php` 按照流程重新生成。 |

---
如需前台配合展示管理员登录状态或 2FA 提示，可通过 `backend/api/check_session.php` 扩展接口返回字段，并在 React 前端根据响应展示登录提示信息。
