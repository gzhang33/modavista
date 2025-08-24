# 多语言系统设置指南

## 概述

本指南将帮助您为您的时尚产品展示网站设置完整的多语言支持，支持欧洲主要语言：英语、意大利语、法语、德语、西班牙语、葡萄牙语、荷兰语和波兰语。

## 数据库升级

### 1. 执行数据库升级脚本

首先，在phpMyAdmin中执行 `database_multilingual_upgrade.sql` 脚本：

```sql
-- 在phpMyAdmin中执行此脚本
-- 或者通过命令行：
mysql -u root -p products < database_multilingual_upgrade.sql
```

### 2. 验证数据库结构

升级后，您的数据库将包含以下新表：

- `languages` - 语言配置表
- `site_content` - 网站内容表
- `site_content_translations` - 内容翻译表
- `user_language_preferences` - 用户语言偏好表

现有表将添加多语言字段：
- `categories`: 添加 `category_name_fr`, `category_name_de`, `category_name_es` 等字段
- `colors`: 添加 `color_name_fr`, `color_name_de`, `color_name_es` 等字段
- `materials`: 添加 `material_name_fr`, `material_name_de`, `material_name_es` 等字段
- `products`: 添加 `description_en`, `description_it`, `description_fr` 等字段

## 导入翻译内容

### 1. 运行翻译导入脚本

```bash
cd tools
php import_translations.php
```

这将导入所有8种语言的网站内容翻译。

### 2. 验证翻译内容

在phpMyAdmin中检查以下表是否有数据：
- `languages` - 应该包含8种语言
- `site_content` - 应该包含网站内容键
- `site_content_translations` - 应该包含所有翻译

## 前端配置

### 1. 确保CSS文件已加载

检查 `index.html` 中是否包含语言切换器样式：

```html
<link rel="stylesheet" href="assets/css/language-switcher.css?v=1.0">
```

### 2. 验证JavaScript组件

确保以下文件存在：
- `assets/js/components/LanguageSwitcher.js`
- `assets/js/components/BaseComponent.js`
- `assets/js/EventBus.js`

### 3. 检查HTML结构

确保页面包含语言切换器容器：

```html
<div class="header-controls">
  <div id="language-switcher-container"></div>
  <!-- 其他控件 -->
</div>
```

## 功能特性

### 1. 语言检测优先级

系统按以下优先级检测用户语言：
1. URL参数 (`?lang=it`)
2. 用户Session
3. 浏览器Cookie
4. 浏览器语言设置
5. 默认语言（英语）

### 2. 动态内容翻译

所有带有 `data-translate` 属性的元素将自动翻译：

```html
<h1 data-translate="site_title">Fashion Collection</h1>
<p data-translate="contact_description">Contact description...</p>
```

### 3. 语言切换器

- 显示当前语言和国旗
- 下拉菜单选择其他语言
- 实时切换页面内容
- 记住用户偏好

### 4. SEO优化

- 动态更新页面标题和描述
- 支持多语言URL参数
- 保持URL结构不变

## API端点

### 获取可用语言
```
GET /api/language.php?action=languages
```

### 获取翻译
```
GET /api/language.php?action=translation&key=site_title
```

### 设置语言
```
POST /api/language.php?action=set_language
Content-Type: application/json

{
  "language_code": "it"
}
```

## 添加新语言

### 1. 在数据库中添加语言

```sql
INSERT INTO languages (language_code, language_name, language_name_native, sort_order) 
VALUES ('sv', 'Swedish', 'Svenska', 9);
```

### 2. 更新翻译脚本

在 `tools/import_translations.php` 中添加新语言的翻译：

```php
'sv' => [
    'site_title' => 'Modekollektion',
    'site_description' => 'Upptäck vår exklusiva modekollektion...',
    // ... 其他翻译
]
```

### 3. 重新运行导入脚本

```bash
php tools/import_translations.php
```

## 故障排除

### 1. 语言切换器不显示

检查：
- CSS文件是否正确加载
- JavaScript控制台是否有错误
- 数据库连接是否正常

### 2. 翻译不生效

检查：
- API端点是否可访问
- 数据库中的翻译数据是否存在
- 网络请求是否成功

### 3. 样式问题

检查：
- CSS变量是否正确定义
- 浏览器兼容性
- 响应式设计

## 性能优化

### 1. 缓存策略

- 翻译内容可以缓存到浏览器localStorage
- 服务器端可以缓存常用翻译
- 使用CDN加速静态资源

### 2. 懒加载

- 只在需要时加载翻译
- 预加载用户最可能使用的语言

### 3. 数据库优化

- 为翻译表添加适当的索引
- 定期清理过期的用户偏好记录

## 维护建议

### 1. 定期更新翻译

- 检查翻译质量
- 添加新的内容翻译
- 更新过时的翻译

### 2. 监控使用情况

- 跟踪最常用的语言
- 分析用户语言偏好
- 优化语言检测算法

### 3. 备份策略

- 定期备份翻译数据
- 版本控制翻译文件
- 测试恢复流程

## 支持的语言

| 语言代码 | 语言名称 | 本地名称 | 状态 |
|---------|---------|---------|------|
| en | English | English | ✅ 默认 |
| it | Italian | Italiano | ✅ 支持 |
| fr | French | Français | ✅ 支持 |
| de | German | Deutsch | ✅ 支持 |
| es | Spanish | Español | ✅ 支持 |
| pt | Portuguese | Português | ✅ 支持 |
| nl | Dutch | Nederlands | ✅ 支持 |
| pl | Polish | Polski | ✅ 支持 |

## 联系支持

如果您在设置过程中遇到问题，请检查：
1. 数据库连接配置
2. 文件权限设置
3. 服务器错误日志
4. 浏览器开发者工具

---

**注意**: 本多语言系统专为欧洲市场设计，支持8种主要欧洲语言。如需添加其他语言，请参考"添加新语言"部分。

