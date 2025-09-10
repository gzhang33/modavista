# 多语言系统 - 混合模式实现

## 概述

本项目实现了多语言网站的混合模式，支持静态文件（JSON）和数据库相结合的方式。这种方式结合了两者的优点：

- **静态文件**：界面文本、固定内容，高性能
- **数据库**：动态内容、产品信息，可管理性强

## 系统架构

### 1. 前端架构

```
client/src/
├── assets/locales/           # 静态翻译文件
│   ├── en.json              # 英文翻译
│   └── zh.json              # 中文翻译
├── contexts/
│   └── LanguageContext.tsx   # 语言上下文
└── utils/
    └── translationUtils.ts   # 翻译工具函数
```

### 2. 后端架构

```
api/
├── language.php              # 多语言API
├── config.php                # 数据库配置
└── utils.php                 # 工具函数

cache/translations/           # 翻译缓存目录
```

### 3. 管理界面

```
admin/
├── translations.php          # 翻译管理界面
├── dashboard.php             # 管理后台（已添加导航）
└── assets/css/dashboard.css  # 样式文件
```

## 翻译文件结构

### 静态翻译文件 (JSON)

```json
{
  "nav": {
    "home": "首页",
    "collections": "产品系列",
    "about": "关于我们",
    "contact": "联系我们"
  },
  "home": {
    "hero": {
      "title": "优质批发服装系列",
      "subtitle": "探索我们为精明批发合作伙伴精心挑选的高品质服装",
      "explore": "浏览系列",
      "samples": "申请样品"
    }
  }
}
```

### 数据库翻译表结构

- `locales`: 语言信息
- `site_content`: 内容键
- `site_content_translation`: 翻译内容

## 使用方法

### 前端使用

```tsx
import { useLanguage } from '@/contexts/LanguageContext';

function MyComponent() {
  const { t } = useLanguage();

  return (
    <div>
      <h1>{t('home.hero.title')}</h1>
      <p>{t('home.hero.subtitle')}</p>
    </div>
  );
}
```

### 异步翻译（用于动态内容）

```tsx
const { tAsync } = useLanguage();

const dynamicTitle = await tAsync('product.name');
// 如果静态翻译中没有，会自动查询数据库
```

### 后端API使用

```php
// 获取翻译
$title = get_translation('home.hero.title', 'zh');

// 获取所有翻译
$all_translations = get_all_translations('en');

// 清空缓存
clear_cache('translation_*');
```

## 性能优化

### 1. 缓存机制

- **内存缓存**：快速访问，进程内共享
- **文件缓存**：持久化存储，重启后仍然有效
- **分层缓存**：内存 → 文件 → 数据库

### 2. 缓存策略

- 语言列表：缓存24小时
- 翻译内容：缓存1小时
- 切换语言时自动清空相关缓存

### 3. 性能测试结果

```
100次翻译查询耗时: 0.0123 秒
平均每次查询耗时: 0.12 毫秒
```

## 管理功能

### 翻译管理界面

访问 `admin/translations.php` 可以：

1. **查看所有翻译**：按语言分组显示
2. **编辑翻译**：实时修改翻译内容
3. **批量操作**：
   - 清空缓存
   - 导出JSON文件
   - 导入翻译数据

### 缓存管理

```php
// 清空所有缓存
clear_cache();

// 清空特定语言缓存
clear_cache('translation_zh_*');

// 清空翻译缓存
clear_cache('translation_*');
```

## 开发指南

### 添加新翻译

1. **静态内容**：添加到 `client/src/assets/locales/` 对应语言文件
2. **动态内容**：通过管理界面或直接插入数据库

### 翻译键命名规范

- 使用点号分隔：`section.subsection.key`
- 使用英文单词：`home.hero.title`
- 保持一致性：相同功能使用相同前缀

### 缓存目录权限

确保 `cache/translations/` 目录有写权限：

```bash
chmod 755 cache/
chmod 755 cache/translations/
```

## 测试

运行测试脚本验证系统功能：

```bash
php test_multilingual_system.php
```

测试内容包括：
- 语言列表获取
- 缓存功能
- 翻译查询
- 静态文件检查
- 性能测试

## 迁移说明

### 从纯数据库模式迁移

1. 导出现有翻译数据
2. 分类静态和动态内容
3. 创建JSON翻译文件
4. 更新前端代码
5. 测试功能完整性

### 兼容性保证

- 保持现有API接口不变
- 支持渐进式迁移
- 向下兼容旧的翻译键格式

## 最佳实践

### 1. 内容分类

- **静态内容**：导航、按钮、固定文本
- **动态内容**：产品名称、描述、用户生成内容

### 2. 缓存策略

- 频繁使用的翻译缓存时间长
- 很少更新的内容缓存时间长
- 开发环境禁用缓存

### 3. 性能监控

- 监控翻译查询性能
- 定期清理过期缓存
- 优化数据库查询

## 故障排除

### 常见问题

1. **翻译不显示**
   - 检查静态文件是否存在
   - 验证翻译键是否正确
   - 查看浏览器控制台错误

2. **缓存问题**
   - 检查缓存目录权限
   - 手动清空缓存文件
   - 重启Web服务器

3. **性能问题**
   - 启用缓存
   - 优化数据库查询
   - 使用批量翻译接口

### 日志和调试

```php
// 启用调试模式
define('DEBUG_TRANSLATION', true);

// 查看翻译查询日志
error_log("Translation query: $key -> $result");
```

## 未来扩展

1. **自动翻译集成**：集成Google Translate API
2. **翻译记忆库**：复用相似翻译
3. **多版本管理**：支持翻译版本控制
4. **协作翻译**：支持多人协作翻译

---

## 总结

这种混合多语言系统提供了：

- ✅ 高性能（静态文件 + 缓存）
- ✅ 灵活性（数据库管理动态内容）
- ✅ 可维护性（管理界面）
- ✅ 可扩展性（支持新语言）
- ✅ 向后兼容（保持现有API）

适合中大型项目的多语言需求。
