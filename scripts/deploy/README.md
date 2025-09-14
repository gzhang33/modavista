# Dreamoda 部署工具包

## 🚀 快速部署

### 推荐方式：一键部署
```batch
# 在项目根目录运行
.\scripts\deploy\deploy.bat
```

## 📁 文件说明

| 文件 | 用途 | 状态 |
|------|------|------|
| `deploy.bat` | **主要部署脚本** | ✅ 推荐使用 |
| `verify_deployment.php` | 部署验证工具 | ✅ 必需 |
| `README.md` | 本文件 | ✅ 说明 |

## 🔧 使用流程

1. **运行部署脚本**
   ```batch
   .\scripts\deploy\deploy.bat
   ```

2. **上传到Hostinger**
   - 上传生成的ZIP文件到 `public_html/`
   - 解压到根目录

3. **验证部署**
   - 访问 `https://yourdomain.com/scripts/deploy/verify_deployment.php`

## 📋 部署包内容

- ✅ 后端API (PHP + 环境适配器)
- ✅ 管理后台 (完整功能)  
- ✅ 前端应用 (React构建)
- ✅ 存储目录 (上传+日志)
- ✅ 服务器配置 (.htaccess)
- ✅ 翻译文件 (5种语言)
- ✅ SEO文件 (sitemap, robots)

## 🛠️ 故障排除

运行验证脚本检查问题：
```bash
https://yourdomain.com/scripts/deploy/verify_deployment.php
```

常见问题：
- 数据库连接失败 → 检查Hostinger数据库配置
- 图片上传失败 → 检查 `storage/uploads/` 权限
- API返回500错误 → 查看错误日志

## 📞 支持

如遇问题，请：
1. 运行验证脚本
2. 查看错误日志
3. 检查文件权限
4. 验证数据库配置
