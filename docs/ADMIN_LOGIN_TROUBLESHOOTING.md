# Admin登录问题排查指南

## 问题描述
访问 [https://dreamoda.store/admin/add_product.php](https://dreamoda.store/admin/add_product.php) 时，下拉菜单中没有内容可以选择，控制台显示API调用失败。

## 问题分析

### 根本原因：会话认证失败
1. **会话检查失败**：`check_session.php` 返回401错误
2. **未登录状态**：用户未通过管理员认证
3. **API拦截**：所有需要认证的API调用被拦截

### 验证结果
- ✅ **API端点正常**：`categories.php` 可以正常返回数据
- ❌ **会话状态**：`check_session.php` 返回 `"loggedIn":false,"session_expired":true`
- ❌ **认证拦截**：未登录用户无法访问需要认证的API

## 解决方案

### 1. 立即修复

#### 步骤1：登录管理员账户
1. 访问 [https://dreamoda.store/admin/login.html](https://dreamoda.store/admin/login.html)
2. 使用正确的管理员凭据登录
3. 确认登录成功后访问add_product页面

#### 步骤2：检查管理员凭据
如果登录失败，检查以下配置：
```php
// backend/config/app.php
define('ADMIN_USERNAME', EnvLoader::get('ADMIN_USERNAME', 'admin'));
define('ADMIN_PASSWORD_HASH', EnvLoader::get('ADMIN_PASSWORD_HASH', '$2y$10$bqXiQg5/wn0zYQ3z/ToAhuBAMXhXK/7Iqmp9PkjXSBBOMeBZevYEy'));
```

### 2. 代码改进

#### 已实施的改进
1. **增强会话检查**：添加了详细的错误日志和重定向逻辑
2. **API错误处理**：在API调用失败时自动重定向到登录页面
3. **用户友好提示**：显示加载失败的错误消息

#### 关键代码更改
```javascript
// 会话检查增强
fetch('../api/check_session.php')
    .then(r=>r.json())
    .then(d=>{ 
        if(!d.loggedIn){ 
            console.log('Session check failed, redirecting to login');
            location.href='login.html'; 
        }
    })
    .catch((error)=>{
        console.error('Session check error:', error);
        location.href='login.html';
    });

// API错误处理
if (error.message && error.message.includes('SESSION_EXPIRED')) {
    console.log('Session expired, redirecting to login');
    window.location.href = 'login.html';
    return;
}
```

### 3. 预防措施

#### 会话管理优化
1. **自动重定向**：未登录用户自动重定向到登录页面
2. **错误提示**：显示清晰的错误消息
3. **会话监控**：监控会话状态和过期时间

#### 部署检查清单
- [ ] 确认管理员凭据正确配置
- [ ] 验证会话管理功能正常
- [ ] 测试API端点可访问性
- [ ] 检查错误日志记录

## 常见问题

### Q: 为什么API端点可以访问但admin页面不行？
A: API端点分为公开访问和需要认证两种。categories.php的GET请求是公开的，但admin页面需要管理员认证。

### Q: 如何重置管理员密码？
A: 修改环境变量中的ADMIN_PASSWORD_HASH，使用PHP的password_hash()函数生成新的哈希值。

### Q: 登录后仍然无法访问怎么办？
A: 检查浏览器cookies、清除缓存、确认会话配置正确。

## 相关文件
- `backend/admin/login.html` - 登录页面
- `backend/api/check_session.php` - 会话检查API
- `backend/api/categories.php` - 分类API
- `backend/admin/assets/js/components/add_product.js` - 产品表单组件
- `backend/config/app.php` - 应用配置

## 测试步骤
1. 访问登录页面：`/admin/login.html`
2. 使用正确凭据登录
3. 访问产品管理页面：`/admin/add_product.php`
4. 验证下拉菜单正常加载
5. 检查控制台无错误信息
