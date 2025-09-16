# CSP Blob URL 修复指南

## 问题描述

在add_product.php和edit_product.php页面中，首次添加图片时出现以下错误：

```
Refused to load the image 'blob:http://localhost/xxx' because it violates the following Content Security Policy directive: "img-src 'self' data:".
```

## 问题根因

Content Security Policy (CSP) 配置过于严格，不允许blob URL用于图片预览。当用户选择图片文件时，JavaScript使用`URL.createObjectURL()`创建blob URL来显示图片预览，但CSP策略阻止了这些URL的加载。

## 解决方案

修改`.htaccess`文件中的CSP配置，允许blob URL和外部CSS资源：

### 修改前
```apache
Header always set Content-Security-Policy "default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; connect-src 'self';"
```

### 修改后
```apache
Header always set Content-Security-Policy "default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; img-src 'self' data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; connect-src 'self';"
```

## 具体变更

1. **img-src指令**: 从 `'self' data:` 改为 `'self' data: blob:`
   - 允许blob URL用于图片预览功能

2. **style-src指令**: 从 `'self' 'unsafe-inline' https://fonts.googleapis.com` 改为 `'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com`
   - 允许从cdnjs.cloudflare.com加载Font Awesome CSS

3. **font-src指令**: 从 `'self' https://fonts.gstatic.com` 改为 `'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com`
   - 允许从cdnjs.cloudflare.com加载Font Awesome字体文件

## 安全考虑

- `blob:` URL仅在本地创建，不会引入外部安全风险
- 添加的CDN域名是可信的Font Awesome官方CDN
- 其他安全策略保持不变

## 测试验证

1. 清除浏览器缓存
2. 访问 https://dreamoda.store/admin/add_product.php
3. 选择多张图片文件
4. 验证图片预览正常显示
5. 检查控制台确认无CSP错误

## 相关文件

- `.htaccess` - CSP配置修改
- `backend/admin/assets/js/components/add_product.js` - 图片预览逻辑
- `backend/admin/add_product.php` - 添加产品页面
- `backend/admin/edit_product.php` - 编辑产品页面

## 注意事项

- 此修复同时解决了图片预览和Font Awesome图标加载问题
- 修改后需要清除浏览器缓存才能生效
- 本地开发环境和生产环境使用相同的CSP配置
- Font Awesome字体文件现在可以正常从 cdnjs.cloudflare.com 加载，解决了控制台中的CSP错误
