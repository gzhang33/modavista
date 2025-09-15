# 图片显示问题排查指南

## 问题描述
本地开发环境可正常查看产品图片，但部署到Hostinger生产环境后图片无法显示。

## 问题分析

### 根本原因
通过控制台错误日志分析，发现生产环境中缺少产品图片文件：
- 404错误：`media-68c44187c1b08-df17fd1a.jpg`
- 404错误：`media-68c44187c2871-c27c7b09.jpg`

### 环境配置验证
✅ **环境适配器工作正常**
- 开发环境：`http://localhost/storage/uploads/product_images/`
- 生产环境：`https://dreamoda.store/storage/uploads/product_images/`

✅ **路径配置正确**
- 前端图片处理逻辑正确
- 后端API返回路径格式正确
- 环境自动切换机制正常

❌ **图片文件缺失**
- 生产环境缺少实际图片文件
- 分类图片正常显示，说明路径配置无误

## 解决方案

### 1. 立即修复（推荐）

#### 方法A：使用提供的同步脚本
```bash
# 在开发环境运行
php scripts/sync_images.php

# 按照脚本输出的命令同步图片到生产环境
```

#### 方法B：手动同步
```bash
# 使用 rsync 同步图片
rsync -avz --progress storage/uploads/product_images/ user@dreamoda.store:/path/to/storage/uploads/product_images/

# 或使用 scp
scp storage/uploads/product_images/* user@dreamoda.store:/path/to/storage/uploads/product_images/
```

### 2. 验证修复

#### 运行诊断脚本
```bash
# 在生产环境运行
php scripts/fix_image_paths.php
```

#### 检查要点
1. 确认图片文件已上传到正确目录
2. 验证文件权限（Web服务器可读）
3. 清除浏览器缓存
4. 重新访问网站验证图片显示

### 3. 预防措施

#### 部署流程优化
1. **自动化部署**：在部署脚本中添加图片同步步骤
2. **文件检查**：部署后自动验证关键文件存在性
3. **备份策略**：定期备份生产环境图片文件

#### 监控机制
1. **错误监控**：监控404错误日志
2. **文件完整性**：定期检查图片文件完整性
3. **性能监控**：监控图片加载性能

## 技术细节

### 图片路径处理流程
1. **数据库存储**：`products/media-xxx.jpg`
2. **API返回**：保持数据库格式
3. **前端处理**：转换为 `/storage/uploads/product_images/media-xxx.jpg`
4. **环境适配**：自动添加正确的域名前缀

### 环境配置
```php
// 开发环境
IMAGES_BASE_URL = '/storage/uploads/'
IMAGES_PRODUCTS_URL = '/storage/uploads/product_images/'

// 生产环境  
IMAGES_BASE_URL = '/storage/uploads/'
IMAGES_PRODUCTS_URL = '/storage/uploads/product_images/'
```

### 文件结构
```
storage/
├── uploads/
│   ├── product_images/     # 产品图片
│   │   ├── media-xxx.jpg
│   │   └── ...
│   ├── categories/         # 分类图片
│   │   ├── tops.jpg
│   │   └── ...
│   └── placeholder-image.svg
```

## 常见问题

### Q: 为什么分类图片正常显示，产品图片不显示？
A: 分类图片文件存在于生产环境，但产品图片文件缺失。需要同步产品图片文件。

### Q: 如何确认图片文件是否同步成功？
A: 运行 `php scripts/fix_image_paths.php` 检查文件存在性和数据库引用。

### Q: 同步后仍然无法显示怎么办？
A: 检查文件权限、Web服务器配置，清除浏览器缓存，查看控制台错误信息。

## 相关文件
- `scripts/fix_image_paths.php` - 图片路径诊断脚本
- `scripts/sync_images.php` - 图片同步脚本
- `backend/config/environment_adapter.php` - 环境适配器
- `frontend/src/lib/image-utils.ts` - 前端图片处理工具
