# API 接口规范文档

## 基础信息

- **Base URL**: `/api/`
- **Content-Type**: `application/json`
- **认证方式**: Session-based authentication

## 通用响应格式

### 成功响应
```json
{
  "success": true,
  "data": {},
  "message": "操作成功"
}
```

### 错误响应
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述"
  }
}
```

## 核心接口

### 1. 产品管理

#### 获取产品列表
- **URL**: `GET /api/products.php`
- **参数**:
  - `page` (可选): 页码，默认1
  - `limit` (可选): 每页数量，默认10
  - `category` (可选): 分类筛选
  - `search` (可选): 搜索关键词

#### 获取产品详情
- **URL**: `GET /api/products.php?id={product_id}`
- **参数**:
  - `id` (必需): 产品ID

#### 创建产品
- **URL**: `POST /api/products.php`
- **请求体**:
```json
{
  "name": "产品名称",
  "description": "产品描述",
  "price": 99.99,
  "category_id": 1,
  "images": ["image1.jpg", "image2.jpg"]
}
```

### 2. 分类管理

#### 获取分类列表
- **URL**: `GET /api/categories.php`

#### 获取分类详情
- **URL**: `GET /api/categories.php?id={category_id}`

### 3. 用户认证

#### 登录
- **URL**: `POST /api/login.php`
- **请求体**:
```json
{
  "username": "用户名",
  "password": "密码"
}
```

#### 登出
- **URL**: `POST /api/logout.php`

#### 检查会话
- **URL**: `GET /api/check_session.php`

### 4. 媒体管理

#### 上传图片
- **URL**: `POST /api/image_manager.php`
- **Content-Type**: `multipart/form-data`
- **参数**:
  - `file` (必需): 图片文件
  - `type` (可选): 文件类型标识

## 错误代码

| 代码 | 描述 |
|------|------|
| `INVALID_PARAMS` | 参数错误 |
| `UNAUTHORIZED` | 未授权访问 |
| `NOT_FOUND` | 资源不存在 |
| `INTERNAL_ERROR` | 服务器内部错误 |
| `VALIDATION_ERROR` | 数据验证失败 |

## 数据验证规则

### 产品数据
- `name`: 必填，长度1-100字符
- `price`: 必填，数字类型，大于0
- `category_id`: 必填，整数类型
- `images`: 可选，字符串数组

### 用户认证
- `username`: 必填，长度3-50字符
- `password`: 必填，长度6-128字符

## 安全规范

1. 所有API请求都需要进行参数验证
2. 敏感操作需要身份验证
3. 文件上传需要类型和大小限制
4. SQL查询使用预处理语句防止注入
5. 返回数据过滤敏感信息
