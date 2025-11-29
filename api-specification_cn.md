API 规范 - Dreamoda 后端
==========================

> 说明：本文件是基于当前 PHP 后端目录 `backend/api` 和共享类型定义 `shared/types/api.ts` 反向整理出的接口说明文档。  
> 实际线上部署时的访问路径（例如 `/api/...`）可能会由 Web 服务器配置进行映射。

## 约定

- **基础路径（Base path）**：所有接口都实现为 `backend/api` 目录下的 PHP 脚本。  
- **认证（Auth）**：
  - 公共接口：通常为针对商品目录数据（产品、分类、材质、颜色、季节）的 `GET` 请求。
  - 受保护接口：写入操作（POST/PUT/DELETE）以及后台管理相关接口，使用 `require_auth()` 或 `require_auth_enhanced()` 进行鉴权。
- **通用响应结构（Common Response Shapes）**：
  - 简单响应：任意 JSON 结构，通常为 `{ success, message }`。
  - 与前端类型对齐的响应：
    - `ApiResponse<T>`:
      - `success: boolean`
      - `data?: T`
      - `message: string`
      - `code?: number`
      - `timestamp: string`
    - `PaginatedResponse<T>`:
      - `success: boolean`
      - `data: { products?: T[]; items?: T[]; pagination: { page, limit, total, pages } }`
      - `message: string`
      - `timestamp: string`

除非特别说明，所有 HTTP 状态码遵循标准 REST 约定（成功为 200/201，客户端错误为 4xx，服务端错误为 5xx）。

---

## 1. 产品（Product）API

### 1.1 `GET /api/products.php`

#### 1.1.1 获取单个 SKU 详情

**描述（Description）**：返回单个 SKU 的详细信息，包括本地化名称、分类、颜色、季节、材质以及媒体资源。

- **认证（Auth）**：不需要。
- **查询参数（Query Parameters）**：
  - `id`（必填，整数）：SKU ID。
  - `lang`（可选，字符串）：
    - 支持简短代码（`en`, `it`, `fr`, `de`, `es`, `zh`）或完整区域代码（`en-GB`, `it-IT` 等）。
    - 在内部通过 `normalize_language_code` 进行归一化。
- **行为（单 SKU 路径，Behavior）**：
  - 关联（JOIN）以下表：
    - `sku`（变体）
    - `spu`（基础产品）
    - `spu_i18n`（本地化产品名称 / 描述）
    - `category` + `category_i18n`
    - `seasons` + `seasons_i18n`
    - `color` + `color_i18n`（通过 `sku_colors` 得到主颜色）
    - `spu_materials` + `material` + `material_i18n`
    - `sku_media`（媒体资源列表）
  - 如果不存在任何 `sku_media` 记录但 `default_image` 已设置，为了结构一致性，可能会自动补一条 `sku_media` 记录。
- **响应（示例结构，简化）**：
  ```json
  {
    "variant_id": 123,
    "sku": 123,
    "product_id": 45,
    "product_name": "Localized Name",
    "product_description": "Localized Description",
    "category_id": 7,
    "category_name": "Localized Category",
    "color_name": "Localized Primary Color",
    "season_name": "Localized Season",
    "default_image": "products/example.jpg",
    "variant_created_at": "2025-01-01 12:00:00",
    "media": [
      "products/example.jpg",
      "products/example-2.jpg"
    ],
    "materials": [
      { "id": 1, "name": "Cotone", "name_en": "Cotton" }
    ],
    "siblings": [
      {
        "id": 124,
        "name": "Base Name - Color Name",
        "default_image": "products/example-variant.jpg",
        "created_at": "2025-01-02 12:00:00"
      }
    ]
  }
  ```
- **错误（Errors）**：
  - 当 SKU 不存在时返回 `404`。
  - 数据库错误返回 `500`。

> 注意：同一个文件中还实现了产品列表、过滤以及写入操作。由于内容较长，本文未完整展开。它们遵循相同的 `lang` 约定，并返回带分页信息的产品数组。

### 1.2 `POST /api/products.php`

**描述**：创建产品 SPU 和/或 SKU（后台管理用途）。

- **认证**：必需（`require_auth_enhanced()`）。
- **请求体（Request Body）**：JSON 结构与 `shared/types/api.ts` 中的 `InsertProduct = Omit<Product, 'id' | 'createdAt'>` 对齐：

```ts
interface Product {
  id: number | string;
  productId?: number;
  spuId?: number;
  skuId?: number;
  name: string;
  baseName?: string;
  description: string;
  category: string;
  color?: string;
  colorCode?: string;
  colors?: Array<{ id: number | string; name: string; code?: string; is_primary?: boolean }>;
  primaryColorId?: number | string;
  primaryColor?: string;
  primaryColorCode?: string;
  secondaryColorId?: number | string;
  secondaryColor?: string;
  secondaryColorCode?: string;
  otherPrimaryColors?: Array<{ sku_id: number | string; color_id: number | string; color_name: string; color_code?: string }>;
  material?: string;
  materials?: Array<{ id: number | string; name: string }>;
  fabric: string;
  style: string;
  season: string;
  care: string;
  origin: string;
  sku: string;
  images: string[];
  specifications: Record<string, string>;
  featured: "yes" | "no";
  defaultImage?: string;
  createdAt?: string;
  siblings?: Product[];
}
```

- **响应**：
  - 成功时返回 201，JSON 中包含成功消息及新建记录的 ID。

### 1.3 `PUT /api/products.php`

**描述**：更新已有的产品 SPU 或 SKU。

- **认证**：必需。
- **请求体**：JSON，包含标识字段（如 SKU/SPU ID）及需要更新的字段。
- **响应**：返回包含 `success` 标志和 `message` 的 JSON。

### 1.4 `DELETE /api/products.php`

**描述**：删除产品 SPU 或 SKU。

- **认证**：必需。
- **请求参数**：标识符可以通过查询参数或 JSON 请求体传入（具体见实现）。
- **响应**：返回包含 `success` 标志和 `message` 的 JSON。

---

## 2. 分类（Categories）、颜色（Colors）、材质（Materials）、季节（Seasons）

这些接口提供带多语言（i18n）支持的目录元数据。所有读取操作都接受 `lang` 和可选的 `admin` 标记；写入操作需要管理员认证。

### 2.1 分类（Categories）

#### 2.1.1 `GET /api/categories.php`

**描述**：获取带本地化名称的分类列表。

- **认证**：`GET` 请求不需要认证。
- **查询参数**：
  - `lang`（可选）：
    - 简短代码：`en`, `it`, `fr`, `de`, `es`, `zh`。
    - 完整区域代码：`en-GB`, `it-IT` 等。
    - 若未提供，则默认 `en-GB`。
  - `admin`（可选，`"1"` 表示启用管理模式）：
    - 当 `admin != 1` 时（公共模式），响应示例：
      ```json
      [
        { "id": 1, "name": "Tessuti", "english_name": "Fabrics" }
      ]
      ```
    - 当 `admin == 1` 时（管理模式），响应示例：
      ```json
      {
        "categories": [
          {
            "id": 1,
            "name": "Tessuti",
            "name_en_gb": "Fabrics",
            "english_name": "Fabrics"
          }
        ],
        "mapping": {
          "Tessuti": "Fabrics"
        }
      }
      ```

#### 2.1.2 `POST /api/categories.php`

**描述**：创建新的分类及其翻译。

- **认证**：必需（非 GET 请求均需要）。
- **请求体**：
  ```json
  {
    "name": "Fabrics",
    "translations": {
      "it": "Tessuti",
      "en": "Fabrics"
    }
  }
  ```
- **行为**：
  - 向 `category` 表写入（字段 `category_name_en`）。
  - 向 `category_i18n` 表插入 `en-GB` 以及 `translations` 中包含的受支持语言的记录。
- **响应**：
  - `201`: `{ "message": "分类 'Fabrics' 添加成功", "id": 1 }`
  - `200`: `{ "message": "分类已存在" }`（分类已存在时）

#### 2.1.3 `DELETE /api/categories.php`

**描述**：根据英文名称删除分类。

- **认证**：必需。
- **请求体**：
  ```json
  { "name": "Fabrics" }
  ```
- **响应**：
  - `200`：删除成功。
  - `404`：未找到对应分类。

#### 2.1.4 `POST /api/admin/categories.php`

**描述**：仅管理员可用的分类创建接口，通过服务层 `CategoryCreator` 实现。

- **认证**：必需。
- **请求体**：JSON，交由 `CategoryCreator::create($payload)` 处理，其中包含验证逻辑以及对翻译网关的调用。
- **响应**：
  - `201`：创建成功，返回服务层结果。
  - `422`：验证失败，返回 `{ message, errors }`。
  - `500`：数据库错误。
  - `502`：外部服务 / 短暂错误。

### 2.2 颜色（Colors）

#### 2.2.1 `GET /api/colors.php`

**描述**：获取带本地化的颜色列表。

- **认证**：`GET` 不需要认证。
- **查询参数**：
  - `lang`（可选）：语义与分类接口相同。
  - `admin`（可选，`"1"` 表示管理模式）。
- **响应**：
  - 公共模式：
    ```json
    ["Rosso", "Blu", "Verde"]
    ```
  - 管理模式：
    ```json
    {
      "colors": [
        {
          "id": 1,
          "name": "Rosso",
          "name_en_gb": "Red",
          "color_code": "#FF0000"
        }
      ],
      "mapping": {
        "Rosso": "Red"
      }
    }
    ```

#### 2.2.2 `POST /api/colors.php`

**描述**：创建新颜色并可选地附带翻译。

- **认证**：必需。
- **请求体**：
  ```json
  {
    "name": "Red",
    "code": "#FF0000",
    "translations": {
      "it": "Rosso"
    }
  }
  ```

#### 2.2.3 `DELETE /api/colors.php`

**请求体**：
```json
{ "name": "Red" }
```

#### 2.2.4 `POST /api/admin/colors.php`

**描述**：仅管理员可用，通过 `ColorCreator` 服务创建颜色。

- 其他行为与 `admin/categories.php` 类似（包括状态码与错误格式）。

### 2.3 材质（Materials）

#### 2.3.1 `GET /api/materials.php`

**描述**：获取带本地化的材质列表。

- **认证**：`GET` 不需要认证。
- **查询参数**：
  - `lang`（可选）：语义与颜色接口相同。
  - `admin`（可选，`"1"` 表示管理模式）。
- **响应**：
  - 公共模式：
    ```json
    ["Cotone", "Seta"]
    ```
  - 管理模式：
    ```json
    {
      "materials": [
        { "id": 1, "name": "Cotone", "name_en_gb": "Cotton" }
      ],
      "mapping": {
        "Cotone": "Cotton"
      }
    }
    ```

#### 2.3.2 `POST /api/materials.php`

**描述**：创建新材质及其翻译（模式与颜色接口相同）。

#### 2.3.3 `DELETE /api/materials.php`

**描述**：根据英文名称（`material_name`）删除材质。

#### 2.3.4 `POST /api/admin/materials.php`

**描述**：仅管理员可用，通过 `MaterialCreator` 服务创建材质。

### 2.4 季节（Seasons）

#### 2.4.1 `GET /api/seasons.php`

**描述**：获取季节列表，并带多语言信息。

- **认证**：不需要。
- **查询参数**：
  - `lang`（可选）：与前文相同的语言映射规则。
  - `admin`（可选，`"1"` 表示管理模式）。
- **响应**：
  - 公共模式：
    ```json
    [
      { "id": 1, "name": "Primavera/Estate" }
    ]
    ```
  - 管理模式：
    ```json
    {
      "seasons": [
        { "id": 1, "name": "Primavera/Estate", "name_en_gb": "Spring/Summer" }
      ],
      "mapping": {
        "Primavera/Estate": "Spring/Summer"
      }
    }
    ```
- **说明（Notes）**：仅支持 `GET`；其他 HTTP 方法会返回 `405`。

---

## 3. 联系表单与询价（Contact & Inquiries）

### 3.1 公共联系表单 - `POST /api/contact.php`

**描述**：公共联系表单接口，用于接收一般消息。

- **认证**：不需要。
- **CORS**：
  - `Access-Control-Allow-Origin: *`
  - `Access-Control-Allow-Methods: POST, OPTIONS`
  - `Access-Control-Allow-Headers: Content-Type`
- **限流（Rate Limiting）**：
  - 每个 IP 每 60 秒至多一次，通过系统临时目录中的临时文件记录实现。
- **请求体（JSON）**：
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+39 ...",
    "company": "ACME",
    "message": "I would like more information..."
  }
  ```
- **校验规则（Validation）**：
  - 必填字段：`name`, `email`, `message`。
  - `email` 必须为合法邮箱格式。
  - 姓名长度：2–100 个字符。
  - 消息长度：10–1000 个字符。
- **行为（Behavior）**：
  - 确保 `contact_messages` 表存在（如不存在则自动创建）。
  - 插入一条记录，包含 `ip_address` 与 `created_at`。
  - 通过 `EmailService::sendContactNotification` 和 `WhatsAppService::sendContactNotification` 触发邮件与 WhatsApp 通知。
- **响应**：
  - 成功：`json_success_response(200, 'CONTACT_SENT_SUCCESS')`（具体提示文案通过 `error_messages.php` 做多语言映射）。
  - 失败：调用 `json_error_response`，返回带语言感知能力的错误码（如 `INVALID_EMAIL`, `RATE_LIMITED`）。

### 3.2 询价（Inquiries）API - `/api/inquiries.php`

该接口为前端产品询价提供统一模型，同时复用 `contact_messages` 表进行存储。

#### 3.2.1 `GET /api/inquiries.php`

**描述**：仅管理员可用，用于分页查看询价记录并支持条件过滤。

- **认证**：必需（`require_auth()`）。
- **查询参数**：
  - `page`（可选，默认 `1`，最小值 `1`）。
  - `limit`（可选，默认 `20`，最大值 `100`）。
  - `status`（可选，字符串）：按 `contact_messages.status` 过滤。
  - `type`（可选，字符串）：按 `contact_messages.inquiry_type` 过滤。
- **响应示例**：
  ```json
  {
    "inquiries": [
      {
        "id": 1,
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "company": "ACME",
        "businessType": "retail",
        "message": "...",
        "productId": null,
        "inquiryType": "general",
        "ipAddress": "1.2.3.4",
        "createdAt": "2025-01-01 10:00:00"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "pages": 1
    }
  }
  ```

#### 3.2.2 `POST /api/inquiries.php`

**描述**：面向公众的产品 / 样品 / 目录询价接口。

- **认证**：不需要。
- **请求体（JSON）**：
  ```json
  {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "company": "ACME",
    "businessType": "retail",
    "message": "I would like to request a sample.",
    "productId": 45,
    "inquiryType": "sample"
  }
  ```
- **校验规则**：
  - 必填字段：`firstName`, `lastName`, `email`, `message`。
  - `email` 必须为合法邮箱格式。
  - `inquiryType` 允许值：`"general" | "sample" | "catalog"`；若值非法则默认为 `"general"`。
- **行为**：
  - 将 `firstName` 与 `lastName` 拼接为单一字段 `name`。
  - 在 `contact_messages` 表中保存扩展字段，包括 `business_type`, `inquiry_type`, `ip_address` 等。
  - 通过 `sendInquiryNotification` 发送邮件与 WhatsApp 通知。
- **响应**（与 `ApiResponse` 类型对齐）：
  ```json
  {
    "success": true,
    "data": {
      "id": 123,
      "message": "感谢您的询价，我们将在24小时内回复您"
    },
    "message": "询价提交成功",
    "timestamp": "2025-01-01 10:00:00"
  }
  ```

---

## 4. 语言与翻译（Language & Translation）

### 4.1 语言元信息 - `/api/language.php`

该脚本既是一个工具库，也是被直接访问时的 HTTP API。

#### 4.1.1 `GET /api/language.php?action=languages`

**描述**：列出所有可用语言及当前用户语言。

- **认证**：不需要。
- **响应示例**：
  ```json
  {
    "languages": [
      {
        "language_code": "en-GB",
        "language_name": "English",
        "language_name_native": "English",
        "is_default": true
      }
    ],
    "current": "en-GB"
  }
  ```

#### 4.1.2 `GET /api/language.php?action=translation&key={content_key}`

**描述**：根据内容键（content key）返回单条翻译。

- **响应示例**：
  ```json
  {
    "key": "homepage.hero.title",
    "text": "Welcome to Dreamoda"
  }
  ```

#### 4.1.3 `GET /api/language.php?action=translations&lang={lang}`

- **描述**：返回指定语言下的全部内容文案翻译。
- **响应示例**：
  ```json
  {
    "language": "en-GB",
    "translations": {
      "homepage.hero.title": "Welcome to Dreamoda",
      "homepage.hero.subtitle": "Premium fabrics..."
    }
  }
  ```

#### 4.1.4 `POST /api/language.php?action=set_language`

**描述**：设置用户的语言偏好。

- **请求体**：
  ```json
  { "language_code": "en-GB" }
  ```
- **行为**：
  - 使用 `locales` 表校验并规范化语言代码。
  - 将语言偏好写入会话（session）、cookie，并可选写入 `user_language_preferences` 表。
- **响应示例**：
  ```json
  { "message": "Language updated successfully" }
  ```

### 4.2 产品翻译服务 - `POST /api/translation.php`

**描述**：仅管理员可用，通过 Microsoft Translator 翻译产品名称，支持自动保存结果到 `spu_i18n` 并写入 `translation_logs` 进行审计。

- **认证**：必需（`require_auth()`）。
- **CORS**：`Access-Control-Allow-Origin: *`，允许 `POST, OPTIONS`。
- **通用请求字段**：
  - `action`: `"translate_product" | "save_translations" | "cleanup_logs"`。

#### 4.2.1 `action = translate_product`

- **请求体**：
  ```json
  {
    "action": "translate_product",
    "content": { "name": "Base Product Name" },
    "source_language": "it",
    "target_languages": ["en-GB", "fr-FR"],
    "product_id": 45,
    "is_new_product": false
  }
  ```
- **行为**：
  - 根据 `locales` 表校验目标语言（支持短代码与完整区域代码）。
  - 可选地对 `source_language` 做白名单校验。
  - 对每种目标语言：
    - 若缓存目录 `cache/translations` 中已有记录，则直接使用缓存。
    - 否则调用 Microsoft Translator，对产品名称进行清洗和长度截断。
    - 对已有产品（`product_id` 已设置）记录翻译日志到 `translation_logs`。
  - 当提供 `product_id` 且 `is_new_product` 为 `false` 时，会自动将翻译结果写入 `spu_i18n`。
- **响应示例**：
  ```json
  {
    "success": true,
    "data": {
      "translations": {
        "name": {
          "en-GB": "Base Product Name (EN)",
          "fr-FR": "Nom du produit (FR)"
        }
      }
    },
    "metadata": {
      "provider": "microsoft_translator",
      "timestamp": "2025-01-01T12:00:00Z",
      "source_language": "it",
      "target_languages": ["en-GB", "fr-FR"]
    }
  }
  ```

#### 4.2.2 `action = save_translations`

- **请求体**：
  ```json
  {
    "action": "save_translations",
    "product_id": 45,
    "translations": {
      "name": {
        "en-GB": "Base Product Name (EN)",
        "it-IT": "Nome prodotto (IT)"
      }
    }
  }
  ```
- **行为**：
  - 校验 `product_id` 在 `spu` 表中存在。
  - 在数据库事务中，为每个语言写入或更新 `spu_i18n`，包含自动生成的 slug，并将状态设置为 `published`。
- **响应**：
  - `200`：`{ "success": true, "message": "翻译内容已保存到数据库" }`
  - `400/404/500`：错误场景，例如 `PRODUCT_NOT_FOUND`, `EMPTY_TRANSLATIONS`, `TX_FAILED` 等。

#### 4.2.3 `action = cleanup_logs`

- **请求体**：
  ```json
  {
    "action": "cleanup_logs",
    "days_to_keep": 30,
    "dry_run": true,
    "provider": "microsoft_translator"
  }
  ```
- **行为**：
  - 计算截断时间 `now - days_to_keep`。
  - 在 `translation_logs` 中统计符合条件的记录数量，可按 `provider` 进行过滤。
  - 若 `dry_run` 为 `false`，则实际删除这些记录。
- **响应示例**：
  ```json
  {
    "success": true,
    "data": {
      "days_to_keep": 30,
      "cutoff": "2025-01-01 00:00:00",
      "provider": "microsoft_translator",
      "matched": 100,
      "deleted": 0,
      "dry_run": true
    },
    "message": "干跑模式：未实际删除任何记录"
  }
  ```

### 4.3 翻译日志 API - `GET /api/admin/translation_logs.php`

**描述**：面向管理员的翻译审计日志查询接口。

- **认证**：必需（管理员）。
- **查询参数**：
  - `content_type`（必填，字符串）：如 `"name"`。
  - `entity_id`（可选，整数）：产品 ID。
  - `target_language`（可选，字符串）。
  - `limit`（可选，整数，最大 1000）。
  - `offset`（可选，整数，默认 0）。
- **响应示例**：
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "product_id": 45,
        "content_type": "name",
        "source_language": "it",
        "target_language": "en-GB",
        "original_text": "...",
        "translated_text": "...",
        "translation_timestamp": "2025-01-01 12:00:00",
        "translation_provider": "microsoft_translator"
      }
    ],
    "meta": {
      "limit": 100,
      "offset": 0,
      "count": 1
    }
  }
  ```
- **错误（按 id 查询路径）**：
  - 若指定了 `id` 且不存在，返回 `404`，消息为 `"Translation log not found"`。

---

## 5. 媒体管理（Media Management）

### 5.1 `GET /api/media.php`

**描述**：列出产品图片，并标注各图片是否被某个 SKU 引用。

- **认证**：必需（`require_auth()`）。
- **行为**：
  - 扫描 `IMAGES_PRODUCTS_DIR` 目录下的所有图片文件（`*.jpg, *.jpeg, *.png, *.gif, *.webp`）。
  - 构建被引用路径集合，来源包括：
    - `sku.default_image`
    - `sku_media.image_path`
- **响应示例**：
  ```json
  [
    { "path": "products/example.jpg", "is_used": true },
    { "path": "products/unused.jpg", "is_used": false }
  ]
  ```

### 5.2 `POST /api/media.php`

**描述**：删除单个图片文件。

- **认证**：必需。
- **请求体**：
  ```json
  { "path": "products/example.jpg" }
  ```
- **行为**：
  - 规范化传入路径，确保解析后仍位于 `IMAGES_PRODUCTS_DIR` 目录之下。
  - 只允许删除该目录下的文件。

### 5.3 `DELETE /api/media.php`

**描述**：批量清理孤立图片（未被任何 SKU 引用的文件）。

- **认证**：必需。
- **响应示例**：
  ```json
  { "deleted": 10 }
  ```

> 说明：`api/image_manager.php` 是一个工具类（`ImageManager`），提供 `getImageUrl`、`saveUploadedImage`、`deleteImage`、`getImageInfo` 等方法，但并未作为独立 HTTP 接口暴露。

---

## 6. 管理端认证与会话（Admin Authentication & Session）

### 6.1 `POST /api/login.php`

**描述**：管理员登录接口，支持可选强制的双因素认证（2FA，TOTP）。

- **认证**：公共接口（用于登录），无需已有会话。
- **CORS**：通过 `handle_cors()` 处理。
- **请求体**：
  ```json
  {
    "username": "admin",
    "password": "secret"
  }
  ```
- **行为**：
  - 将凭证与 `admin` 表中的记录进行校验。
  - 通过 `login_failed_count` 与 `locked_until` 字段追踪失败尝试次数与锁定状态。
  - 通过环境适配器判断是否需要 2FA：
    - 若需要且 2FA 已正确配置：
      - 检查可信设备 cookie；若存在且有效，则免 2FA 直接登录。
      - 否则签发一次性挑战 token，并返回 `requires2fa: true`。
    - 若需要但 2FA 配置无效：重置 2FA 相关数据并返回 `requireSetup: true`。
  - 登录成功后，通过 `SecurityHelper::finalizeAdminLogin` 设置会话并记录日志。
- **响应**：
  - 密码错误：返回 `401`，消息 `"账号或密码错误"`。
  - 账号被锁定：返回 `423`，消息 `"账号暂时锁定，请稍后再试"`。
  - 需要 2FA 时：
    ```json
    {
      "success": false,
      "requires2fa": true,
      "twoFactorToken": "challenge-token",
      "message": "账号已启用二次验证，请输入动态验证码"
    }
    ```
  - 登录成功：
    ```json
    {
      "success": true,
      "message": "登录成功，正在跳转后台..."
    }
    ```

### 6.2 `POST /api/verify_2fa.php`

**描述**：校验 TOTP 动态码并完成登录流程。

- **认证**：需要已有的待验证 2FA 会话。
- **请求体**：
  ```json
  {
    "token": "challenge-token",
    "code": "123456",
    "rememberDevice": true
  }
  ```
- **行为**：
  - 根据 `$_SESSION['pending_2fa']` 验证挑战 token。
  - 校验 TOTP 动态码，限制最大尝试次数，并通过对比 `last_totp_timestamp` 防止重放。
  - 当 `rememberDevice` 为 `true` 时，签发可信设备 cookie。
- **响应示例**：
  ```json
  {
    "success": true,
    "message": "验证通过，正在登录"
  }
  ```

### 6.3 `POST /api/logout.php`

**描述**：管理员登出并销毁会话。

- **认证**：需要有效会话及 CSRF token。
- **CSRF**：
  - 可从以下位置获取 `csrf_token`：
    - 表单字段 `csrf_token`
    - Header `X-CSRF-TOKEN`
    - JSON 请求体字段 `csrf_token`
- **响应示例**：
  ```json
  { "success": true, "message": "已成功退出登录" }
  ```

### 6.4 `GET /api/check_session.php`

**描述**：检查当前管理员会话是否仍然有效。

- **认证**：基于 session。
- **响应**：
  - 已登录：
    ```json
    {
      "loggedIn": true,
      "username": "Admin",
      "lastActivity": 1700000000
    }
    ```
  - 未登录或会话已过期：
    ```json
    {
      "loggedIn": false,
      "session_expired": true,
      "message": "登录已超时，请重新登录"
    }
    ```

---

## 7. 管理端联系消息（Admin Contact Messages）

### 7.1 `/api/contact_messages.php`

#### 7.1.1 `GET /api/contact_messages.php`

**描述**：仅管理员可用，用于查看公共联系表单保存的消息列表。

- **认证**：必需（管理员会话）。
- **响应示例**：
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "message": "Hello",
        "ip_address": "1.2.3.4",
        "created_at": "2025-01-01 10:00:00",
        "is_processed": false,
        "processed_at": null,
        "todo": {
          "status": "待定",
          "notes": null
        }
      }
    ],
    "count": 1
  }
  ```

#### 7.1.2 `POST /api/contact_messages.php`

**描述**：更新联系消息的 TODO 元数据（状态与备注）。

- **认证**：必需。
- **请求体**：
  ```json
  {
    "action": "update_todo",
    "message_id": 1,
    "status": "完成",
    "notes": "Customer replied, ticket closed."
  }
  ```
- **行为**：
  - 当 `status` 为 `"完成"` 时，设置 `is_processed = 1`，并将 `processed_at` 置为当前时间。
  - 其他状态下，`is_processed = 0`，`processed_at` 置为 `null`。
- **响应示例**：
  ```json
  {
    "success": true,
    "message": "Todo updated successfully"
  }
  ```

---

## 8. 错误消息与本地化辅助方法（Error Messages & Localization Helpers）

以下工具脚本虽然不是独立的 HTTP 接口，但会影响多个 API 的行为：

- `api/error_messages.php`：
  - 为多语言（`en`, `fr`, `de`, `es`, `it`）提供统一的错误与成功消息字典。
  - 被 `json_error_response` 与 `json_success_response` 调用，用于标准化返回结构。
- `get_request_language()`：
  - 根据 `Accept-Language` 请求头或 `lang` 查询参数确定语言，默认值为 `en`。

这些工具被 `contact.php`、`translation.php` 以及其他返回多语言文案的接口复用。

---

## 备注与后续工作建议（Notes & Future Work）

- 本文刻意没有对 `products.php` 中大而复杂的列表型接口做过度展开。  
  如有需要，可以基于同一文件继续补充独立章节，例如「产品列表」、「按分类 / 颜色 / 季节过滤」、「搜索」等。
- 实际 HTTP 基础路径（例如 `/api/`）可能会因 Web 服务器与部署配置而不同。




