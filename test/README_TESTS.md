# 管理后台测试文档

## 概述

本项目使用 Playwright 进行端到端测试，主要测试管理后台的功能和用户体验。

⚠️ **重要**: 请在运行测试前阅读 `.cursorrules` 文件中的 "TESTING RULES & BEST PRACTICES" 部分。

## 测试文件结构

```
test/
├── admin_login.spec.js          # 管理员登录功能测试
├── admin_dashboard.spec.js      # 管理后台主要功能测试
├── session_handling.spec.js     # 会话过期处理测试
├── public_site_basic.spec.js    # 公共网站基础功能测试
├── run_dashboard_tests.js       # 测试运行脚本
├── validate_test_environment.js # 测试环境验证脚本
├── check_config.js             # 配置检查脚本
└── README_TESTS.md             # 本文档
```

## 测试内容

### 1. 管理员登录测试 (`admin_login.spec.js`)
- ✅ 登录表单元素显示
- ✅ 错误凭据的错误处理
- ✅ 成功登录和重定向

### 2. 管理后台功能测试 (`admin_dashboard.spec.js`)
- ✅ 主要界面元素显示
- ✅ 统计概览功能
- ✅ 产品管理导航
- ✅ 产品表单操作
- ✅ 批量操作功能
- ✅ 响应式导航菜单
- ✅ 模态框和通知系统

### 3. 会话过期处理测试 (`session_handling.spec.js`)
- ✅ 产品归档时的会话过期处理
- ✅ 批量归档时的会话过期处理
- ✅ 产品删除时的会话过期处理
- ✅ 表单提交时的会话过期处理
- ✅ 批量删除时的会话过期处理
- ✅ 正常授权操作验证
- ✅ Toast通知时机验证

## 运行测试

### 前提条件

⚠️ **关键配置检查**：
```bash
# 1. 快速配置检查
node test/check_config.js

# 2. 完整环境验证  
node test/validate_test_environment.js
```

1. **确保服务器运行**：
   ```bash
   # 启动 XAMPP 或确保 Apache 和 MySQL 运行
   # 确保项目可以通过 http://localhost 访问（不是 /htdocs）
   ```

2. **安装依赖**：
   ```bash
   npm install
   ```

3. **安装 Playwright 浏览器**：
   ```bash
   npx playwright install
   ```

### 运行所有测试

```bash
# 使用自定义脚本运行所有测试
node test/run_dashboard_tests.js

# 或者直接使用 Playwright
npx playwright test
```

### 运行特定测试

```bash
# 运行登录测试
npx playwright test test/admin_login.spec.js

# 运行管理后台测试
npx playwright test test/admin_dashboard.spec.js

# 运行会话处理测试
npx playwright test test/session_handling.spec.js

# 使用自定义脚本运行特定测试
node test/run_dashboard_tests.js admin_login
```

### 调试模式

```bash
# 以调试模式运行测试（显示浏览器窗口）
npx playwright test --debug

# 运行特定测试的调试模式
npx playwright test test/admin_dashboard.spec.js --debug
```

## 测试配置

测试配置在 `playwright.config.js` 中定义：

- **Base URL**: `http://localhost/htdocs`
- **浏览器**: Chromium (可扩展到 Firefox, Safari)
- **超时设置**: 
  - 操作超时: 10秒
  - 导航超时: 30秒
- **失败时自动截图和录制视频**

## 重要注意事项

### 默认管理员凭据
测试使用以下默认凭据：
- 用户名: `admin`
- 密码: `admin`

### 会话过期测试
会话过期测试通过调用 `/api/logout.php` 来模拟会话失效，然后验证前端的错误处理逻辑是否正确：

1. 显示友好的过期提示消息
2. 在2.5秒后自动重定向到登录页面
3. 不显示技术性错误消息

### 测试数据
- 测试不会影响实际的生产数据
- 某些测试依赖于数据库中存在产品数据
- 如果数据库为空，部分测试会跳过相关操作

## 故障排除

### 常见问题

1. **测试超时**：
   - 检查服务器是否正在运行
   - 确认 Base URL 配置正确
   - 增加超时时间设置

2. **登录失败**：
   - 验证管理员凭据是否正确
   - 检查数据库连接
   - 确认 session 配置正确

3. **元素未找到**：
   - 检查页面是否完全加载
   - 验证选择器是否正确
   - 使用 `--debug` 模式检查页面状态

### 调试技巧

```bash
# 生成测试代码
npx playwright codegen http://localhost/htdocs/admin/login.html

# 查看测试报告
npx playwright show-report

# 以慢速模式运行（便于观察）
npx playwright test --slow-mo=1000
```

## 测试最佳实践

1. **可靠的选择器**：使用 ID、data 属性或明确的文本内容
2. **等待策略**：使用 `waitForLoadState('networkidle')` 确保页面完全加载
3. **错误处理**：测试中包含适当的错误处理和超时设置
4. **清理工作**：每个测试后自动清理状态
5. **独立性**：每个测试都是独立的，不依赖其他测试的状态

## 扩展测试

要添加新的测试：

1. 在 `test/` 目录创建新的 `.spec.js` 文件
2. 遵循现有的测试模式和命名约定
3. 在 `run_dashboard_tests.js` 中添加新的测试套件
4. 更新本文档

## 持续集成

这些测试可以轻松集成到 CI/CD 管道中：

```yaml
# GitHub Actions 示例
- name: Run Playwright Tests
  run: |
    npx playwright install
    npm test
```