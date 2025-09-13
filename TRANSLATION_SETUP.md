---
title: DreaModa 智能多语言翻译功能配置指南
version: 1.0.0
last_updated: 2025-09-12
type: configuration_guide
---

# DreaModa 智能多语言翻译功能配置指南

## 功能概述

智能多语言翻译功能通过OpenAI API自动生成产品名称和描述的多语言版本，支持中文、意大利语、英语、德语、法语和西班牙语之间的互译。

## API密钥配置

### 获取OpenAI API密钥
1. 访问 [OpenAI Platform](https://platform.openai.com/api-keys)
2. 登录您的OpenAI账户
3. 创建新的API密钥
4. 复制生成的API密钥（格式：sk-...）

### 配置环境变量

**方法一：.htaccess文件配置（推荐）**
1. 复制项目根目录中的 `.htaccess.translation.example` 文件：
   ```bash
   cp .htaccess.translation.example .htaccess
   ```

2. 编辑 `.htaccess` 文件，更新实际的API密钥：
   ```apache
   SetEnv OPENAI_API_KEY "sk-your-actual-openai-api-key-here"
   ```

**方法二：服务器环境变量配置**
如果您有服务器管理权限，可以直接在服务器环境中设置：
```bash
export OPENAI_API_KEY="sk-your-actual-openai-api-key-here"
```

### 安全注意事项
- ⚠️ **绝不要**将API密钥提交到版本控制系统
- 📁 确保 `.htaccess` 文件已添加到 `.gitignore`
- 🔒 定期轮换API密钥（建议30天更新一次）
- 📊 监控API使用量和费用
- 🛡️ 设置API使用限额以控制成本

## 功能使用方法

### 在产品添加页面
1. 进入 `admin/add_product.php`
2. 填写产品名称和描述（中文或意大利语）
3. 在翻译组件中选择源语言和目标语言
4. 点击"生成多语言版本"按钮
5. 预览翻译结果，支持手动编辑
6. 点击"应用翻译"将结果应用到表单

### 在产品编辑页面
1. 进入 `admin/edit_product.php?id=产品ID`
2. 修改产品名称或描述
3. 使用翻译组件生成更新的翻译
4. 应用翻译并保存产品

### 支持的语言
- **源语言**：中文(cn)、意大利语(it)、英语(en)
- **目标语言**：英语(en)、德语(de)、法语(fr)、意大利语(it)、西班牙语(es)

## 缓存和性能

### 翻译缓存
- 相同内容的翻译结果缓存24小时
- 缓存文件存储在 `cache/translations/` 目录
- 缓存基于源语言+目标语言+原文的MD5哈希

### 性能优化
- 使用MD5哈希识别重复内容，避免重复翻译
- 批量翻译支持并发处理
- 失败重试机制（最多3次）

## API使用监控

### 成本控制
OpenAI GPT-3.5-turbo 定价：
- 输入：$0.001 / 1K tokens
- 输出：$0.002 / 1K tokens

预估成本：
- 产品名称翻译：~$0.001 per product
- 产品描述翻译：~$0.005 per product

### 使用记录
翻译记录存储在 `translation_logs` 数据库表中，包含：
- 产品ID和内容类型
- 源语言和目标语言
- 原文和译文
- 翻译时间戳

## 故障排除

### 常见错误
**"OpenAI API密钥未配置"**
- 检查 `.htaccess` 文件是否存在且配置正确
- 确认API密钥格式正确（以sk-开头）

**"翻译配额已用尽"**
- 检查OpenAI账户余额和使用限额
- 考虑升级OpenAI服务计划

**"网络不稳定"**
- 检查服务器网络连接
- 验证是否能访问 `api.openai.com`

### 日志查看
翻译相关错误记录在服务器错误日志中：
```bash
tail -f /var/log/apache2/error.log | grep "Translation error"
```

## 数据库设置

翻译功能使用以下数据表，确保它们已正确创建：

### 多语言产品表 (product_i18n)
```sql
-- 此表应该已经存在，用于存储多语言产品信息
SELECT * FROM product_i18n LIMIT 1;
```

### 翻译日志表 (translation_logs)
```sql
-- 验证翻译日志表是否存在
DESCRIBE translation_logs;
```

如果表不存在，请联系系统管理员创建相应的数据表结构。

## 支持与维护

- 📧 技术支持：admin@dreamoda.com
- 📚 更多文档：查看项目README.md
- 🔄 版本更新：定期检查系统更新

---

**配置完成后，您就可以开始使用智能多语言翻译功能了！** 🎉