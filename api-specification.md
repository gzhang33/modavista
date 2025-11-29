API Specification - Dreamoda Backend
====================================

> Note: This document is a reverse-engineered specification based on the current PHP backend (`backend/api`) and shared types (`shared/types/api.ts`).  
> Actual deployment paths (e.g. `/api/...`) may be mapped by web server configuration.

## Conventions

- **Base path**: All endpoints are implemented as PHP scripts in `backend/api`.  
- **Auth**:
  - Public endpoints: typically `GET` on catalog data (products, categories, colors, materials, seasons).
  - Protected endpoints: write operations (POST/PUT/DELETE) and admin tooling, using `require_auth()` or `require_auth_enhanced()`.
- **Common Response Shapes**:
  - Simple responses: arbitrary JSON structure, often `{ success, message }`.
  - Typed responses (front-end aligned):
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

All HTTP status codes follow standard REST conventions (200/201 for success, 4xx for client errors, 5xx for server errors) unless otherwise noted.

---

## 1. Product API

### 1.1 `GET /api/products.php`

#### 1.1.1 Get single SKU details

**Description**: Returns detailed information for a single SKU, including localized names, category, colors, season, materials, and media.

- **Auth**: Not required.
- **Query Parameters**:
  - `id` (required, integer): SKU ID.
  - `lang` (optional, string):
    - Accepts short codes (`en`, `it`, `fr`, `de`, `es`, `zh`) or full locales (`en-GB`, `it-IT`, etc.).
    - Normalized internally via `normalize_language_code`.
- **Behavior (single SKU path)**:
  - Joins:
    - `sku` (as variant)
    - `spu` (base product)
    - `spu_i18n` (localized product name/description)
    - `category` + `category_i18n`
    - `seasons` + `seasons_i18n`
    - `color` + `color_i18n` (primary color via `sku_colors`)
    - `spu_materials` + `material` + `material_i18n`
    - `sku_media` for media gallery
  - If no `sku_media` entries exist but `default_image` is set, one `sku_media` row may be auto-backfilled for consistency.
- **Response (shape, simplified)**:
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
- **Errors**:
  - `404` if SKU does not exist.
  - `500` for DB errors.

> Note: The same file also implements product listing, filtering, and write operations. Those parts are long and not fully listed here; they follow the same `lang` convention and return product arrays with pagination.

### 1.2 `POST /api/products.php`

**Description**: Creates a product/SPU and/or SKU (admin/backoffice usage).

- **Auth**: Required (`require_auth_enhanced()`).
- **Request Body**: JSON aligned with `InsertProduct = Omit<Product, 'id' | 'createdAt'>` from `shared/types/api.ts`:
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
- **Response**:
  - 201 with a JSON body including a success message and created IDs.

### 1.3 `PUT /api/products.php`

**Description**: Updates an existing product/SPU or SKU.

- **Auth**: Required.
- **Request Body**: JSON including identifiers (e.g. SKU/SPU IDs) and fields to update.
- **Response**: JSON with success flag and message.

### 1.4 `DELETE /api/products.php`

**Description**: Deletes a product/SPU or SKU.

- **Auth**: Required.
- **Request Input**: Identifier passed either via query or JSON body (see implementation).
- **Response**: JSON with success flag and message.

---

## 2. Categories, Colors, Materials, Seasons

These endpoints provide catalog metadata with i18n support. All read operations accept `lang` and optional `admin` flags; write operations require admin authentication.

### 2.1 Categories

#### 2.1.1 `GET /api/categories.php`

**Description**: Fetches a list of categories with localization.

- **Auth**: Not required for `GET`.
- **Query Parameters**:
  - `lang` (optional):
    - Short codes: `en`, `it`, `fr`, `de`, `es`, `zh`.
    - Full locales: `en-GB`, `it-IT`, etc.
    - Defaults to `en-GB` if omitted.
  - `admin` (optional, `"1"` to enable admin mode):
    - `admin != 1` (public mode):
      ```json
      [
        { "id": 1, "name": "Tessuti", "english_name": "Fabrics" }
      ]
      ```
    - `admin == 1` (admin mode):
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

**Description**: Creates a new category and its translations.

- **Auth**: Required (non-GET).
- **Request Body**:
  ```json
  {
    "name": "Fabrics",
    "translations": {
      "it": "Tessuti",
      "en": "Fabrics"
    }
  }
  ```
- **Behavior**:
  - Inserts into `category` (`category_name_en`).
  - Inserts into `category_i18n` for `en-GB` and supported locales from `translations`.
- **Responses**:
  - `201`: `{ "message": "分类 'Fabrics' 添加成功", "id": 1 }`
  - `200`: `{ "message": "分类已存在" }` if already present.

#### 2.1.3 `DELETE /api/categories.php`

**Description**: Deletes a category by its English name.

- **Auth**: Required.
- **Request Body**:
  ```json
  { "name": "Fabrics" }
  ```
- **Responses**:
  - `200`: Success, category deleted.
  - `404`: Category not found.

#### 2.1.4 `POST /api/admin/categories.php`

**Description**: Admin-only category creation via service layer (`CategoryCreator`).

- **Auth**: Required.
- **Request Body**: JSON payload handled by `CategoryCreator::create($payload)` (includes validation and translation gateway usage).
- **Responses**:
  - `201`: Created, returns result from service.
  - `422`: Validation error with `{ message, errors }`.
  - `500`: Database error.
  - `502`: External/transient error.

### 2.2 Colors

#### 2.2.1 `GET /api/colors.php`

**Description**: Fetches colors with localization.

- **Auth**: Not required for `GET`.
- **Query Parameters**:
  - `lang` (optional): Same semantics as categories.
  - `admin` (optional, `"1"` for admin mode).
- **Responses**:
  - Public mode:
    ```json
    ["Rosso", "Blu", "Verde"]
    ```
  - Admin mode:
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

**Description**: Creates a new color with optional translations.

- **Auth**: Required.
- **Request Body**:
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

**Request Body**:
```json
{ "name": "Red" }
```

#### 2.2.4 `POST /api/admin/colors.php`

**Description**: Admin-only color creation via `ColorCreator`.

- Same patterns as `admin/categories.php` (status codes and error formats).

### 2.3 Materials

#### 2.3.1 `GET /api/materials.php`

**Description**: Fetches materials with localization.

- **Auth**: Not required for `GET`.
- **Query Parameters**:
  - `lang` (optional): Same as colors.
  - `admin` (optional, `"1"` for admin mode).
- **Responses**:
  - Public:
    ```json
    ["Cotone", "Seta"]
    ```
  - Admin:
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

**Description**: Creates a new material with translations (same pattern as colors).

#### 2.3.3 `DELETE /api/materials.php`

**Description**: Deletes a material by English name (`material_name`).

#### 2.3.4 `POST /api/admin/materials.php`

**Description**: Admin-only material creation via `MaterialCreator`.

### 2.4 Seasons

#### 2.4.1 `GET /api/seasons.php`

**Description**: Fetches season list with localization.

- **Auth**: Not required.
- **Query Parameters**:
  - `lang` (optional): Same mapping rules.
  - `admin` (optional, `"1"` for admin mode).
- **Responses**:
  - Public:
    ```json
    [
      { "id": 1, "name": "Primavera/Estate" }
    ]
    ```
  - Admin:
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
- **Notes**: Only `GET` is supported; any other method returns `405`.

---

## 3. Contact & Inquiries

### 3.1 Public Contact Form - `POST /api/contact.php`

**Description**: Public contact form endpoint for general messages.

- **Auth**: Not required.
- **CORS**:
  - `Access-Control-Allow-Origin: *`
  - `Access-Control-Allow-Methods: POST, OPTIONS`
  - `Access-Control-Allow-Headers: Content-Type`
- **Rate Limiting**:
  - 1 request per IP per 60 seconds, enforced via temp file in system temp directory.
- **Request Body (JSON)**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+39 ...",
    "company": "ACME",
    "message": "I would like more information..."
  }
  ```
- **Validation**:
  - Required fields: `name`, `email`, `message`.
  - Email must be valid.
  - Name length: 2–100 chars.
  - Message length: 10–1000 chars.
- **Behavior**:
  - Ensures `contact_messages` table exists (creates it if necessary).
  - Inserts message with `ip_address` and `created_at`.
  - Triggers email and WhatsApp notifications via `EmailService::sendContactNotification` and `WhatsAppService::sendContactNotification`.
- **Response**:
  - Success: `json_success_response(200, 'CONTACT_SENT_SUCCESS')` (message localized via `error_messages.php`).
  - Errors: `json_error_response` with language-aware error codes (e.g. `INVALID_EMAIL`, `RATE_LIMITED`).

### 3.2 Inquiries API - `/api/inquiries.php`

Provides a unified model for front-end product inquiries while reusing `contact_messages` storage.

#### 3.2.1 `GET /api/inquiries.php`

**Description**: Admin-only listing of inquiries with pagination and filters.

- **Auth**: Required (`require_auth()`).
- **Query Parameters**:
  - `page` (optional, default `1`, min `1`).
  - `limit` (optional, default `20`, max `100`).
  - `status` (optional, string): filters by `contact_messages.status`.
  - `type` (optional, string): filters by `contact_messages.inquiry_type`.
- **Response**:
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

**Description**: Public endpoint for product/sample/catalog inquiries.

- **Auth**: Not required.
- **Request Body (JSON)**:
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
- **Validation**:
  - Required: `firstName`, `lastName`, `email`, `message`.
  - Email must be valid.
  - `inquiryType` allowed values: `"general" | "sample" | "catalog"`; defaults to `"general"` if invalid.
- **Behavior**:
  - Combines `firstName` and `lastName` into `name`.
  - Stores extended fields in `contact_messages` (including `business_type`, `inquiry_type`, `ip_address`).
  - Sends email and WhatsApp notifications via `sendInquiryNotification`.
- **Response** (aligned with `ApiResponse`):
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

## 4. Language & Translation

### 4.1 Language Meta - `/api/language.php`

This endpoint is both a utility library and an HTTP API when accessed directly.

#### 4.1.1 `GET /api/language.php?action=languages`

**Description**: Lists available languages and the current user language.

- **Auth**: Not required.
- **Response**:
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

**Description**: Returns translation for a single content key.

- **Response**:
  ```json
  {
    "key": "homepage.hero.title",
    "text": "Welcome to Dreamoda"
  }
  ```

#### 4.1.3 `GET /api/language.php?action=translations&lang={lang}`

- **Description**: Returns all content translations for the given language.
- **Response**:
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

**Description**: Sets the user language preference.

- **Request Body**:
  ```json
  { "language_code": "en-GB" }
  ```
- **Behavior**:
  - Normalizes and validates language code against `locales` table.
  - Stores preference in session, cookie, and optionally `user_language_preferences`.
- **Response**:
  ```json
  { "message": "Language updated successfully" }
  ```

### 4.2 Product Translation Service - `POST /api/translation.php`

**Description**: Admin-only service for product name translation via Microsoft Translator. Supports auto-saving results to `spu_i18n` and logging to `translation_logs`.

- **Auth**: Required (`require_auth()`).
- **CORS**: `Access-Control-Allow-Origin: *`, `POST, OPTIONS`.
- **Common Request Fields**:
  - `action`: `"translate_product" | "save_translations" | "cleanup_logs"`.

#### 4.2.1 `action = translate_product`

- **Request Body**:
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
- **Behavior**:
  - Validates target languages against `locales` (short and full codes).
  - Optionally validates `source_language` against a whitelist.
  - For each target language:
    - Uses cache (`cache/translations`) if available.
    - Otherwise calls Microsoft Translator, cleans and truncates product name.
    - Logs translation to `translation_logs` for existing products (`product_id` set).
  - If `product_id` is provided and `is_new_product` is `false`, automatically saves translations into `spu_i18n`.
- **Response**:
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

- **Request Body**:
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
- **Behavior**:
  - Validates `product_id` exists in `spu`.
  - In a transaction, writes/updates `spu_i18n` for each locale with a generated slug and sets status to `published`.
- **Responses**:
  - `200`: `{ "success": true, "message": "翻译内容已保存到数据库" }`
  - `400/404/500`: Error codes such as `PRODUCT_NOT_FOUND`, `EMPTY_TRANSLATIONS`, `TX_FAILED`.

#### 4.2.3 `action = cleanup_logs`

- **Request Body**:
  ```json
  {
    "action": "cleanup_logs",
    "days_to_keep": 30,
    "dry_run": true,
    "provider": "microsoft_translator"
  }
  ```
- **Behavior**:
  - Calculates cutoff timestamp `now - days_to_keep`.
  - Counts matching entries in `translation_logs`, optionally filtered by `provider`.
  - If `dry_run` is `false`, deletes them.
- **Response**:
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

### 4.3 Translation Logs API - `GET /api/admin/translation_logs.php`

**Description**: Admin-facing API to query translation audit logs.

- **Auth**: Required (admin).
- **Query Parameters**:
  - `content_type` (required, string): e.g. `"name"`.
  - `entity_id` (optional, integer): product ID.
  - `target_language` (optional, string).
  - `limit` (optional, integer, max 1000).
  - `offset` (optional, integer, default 0).
- **Responses**:
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
- **Error (by id path)**:
  - If `id` is specified and not found: `404` with `"Translation log not found"`.

---

## 5. Media Management

### 5.1 `GET /api/media.php`

**Description**: Lists product images and whether they are referenced by SKUs.

- **Auth**: Required (`require_auth()`).
- **Behavior**:
  - Scans `IMAGES_PRODUCTS_DIR` for all image files (`*.jpg, *.jpeg, *.png, *.gif, *.webp`).
  - Builds a set of referenced paths from:
    - `sku.default_image`
    - `sku_media.image_path`
- **Response**:
  ```json
  [
    { "path": "products/example.jpg", "is_used": true },
    { "path": "products/unused.jpg", "is_used": false }
  ]
  ```

### 5.2 `POST /api/media.php`

**Description**: Deletes a single image file.

- **Auth**: Required.
- **Request Body**:
  ```json
  { "path": "products/example.jpg" }
  ```
- **Behavior**:
  - Normalizes incoming path to ensure it resolves inside `IMAGES_PRODUCTS_DIR`.
  - Only files under the allowed directory can be deleted.

### 5.3 `DELETE /api/media.php`

**Description**: Batch cleanup of orphan images (files not referenced by any SKU).

- **Auth**: Required.
- **Response**:
  ```json
  { "deleted": 10 }
  ```

> Note: `api/image_manager.php` is a utility class (`ImageManager`) providing `getImageUrl`, `saveUploadedImage`, `deleteImage`, and `getImageInfo`, but is not exposed as a standalone HTTP endpoint.

---

## 6. Admin Authentication & Session

### 6.1 `POST /api/login.php`

**Description**: Admin login with optional mandatory 2FA (TOTP).

- **Auth**: Public (for login).
- **CORS**: Handled via `handle_cors()`.
- **Request Body**:
  ```json
  {
    "username": "admin",
    "password": "secret"
  }
  ```
- **Behavior**:
  - Validates credentials against `admin` table.
  - Tracks failed attempts via `login_failed_count` and `locked_until`.
  - Consults environment adapter to determine if 2FA is required:
    - If required and 2FA configured:
      - Checks for trusted device cookie; if present and valid, logs in without 2FA.
      - Otherwise issues a challenge token and returns `requires2fa: true`.
    - If required but 2FA config invalid: resets 2FA data and returns `requireSetup: true`.
  - On successful login, `SecurityHelper::finalizeAdminLogin` sets session and logs the event.
- **Responses**:
  - Password error: `401` with `"账号或密码错误"`.
  - Account locked: `423` with `"账号暂时锁定，请稍后再试"`.
  - 2FA required:
    ```json
    {
      "success": false,
      "requires2fa": true,
      "twoFactorToken": "challenge-token",
      "message": "账号已启用二次验证，请输入动态验证码"
    }
    ```
  - Login success:
    ```json
    {
      "success": true,
      "message": "登录成功，正在跳转后台..."
    }
    ```

### 6.2 `POST /api/verify_2fa.php`

**Description**: Verifies TOTP code and completes login.

- **Auth**: Requires an existing pending 2FA session.
- **Request Body**:
  ```json
  {
    "token": "challenge-token",
    "code": "123456",
    "rememberDevice": true
  }
  ```
- **Behavior**:
  - Validates challenge token against `$_SESSION['pending_2fa']`.
  - Verifies TOTP; enforces max attempts and prevents replay by comparing with `last_totp_timestamp`.
  - Optionally issues a trusted-device cookie when `rememberDevice` is true.
- **Response**:
  ```json
  {
    "success": true,
    "message": "验证通过，正在登录"
  }
  ```

### 6.3 `POST /api/logout.php`

**Description**: Logs out admin and destroys session.

- **Auth**: Requires valid session and CSRF token.
- **CSRF**:
  - Accepts `csrf_token` from:
    - Form POST field `csrf_token`
    - Header `X-CSRF-TOKEN`
    - JSON body field `csrf_token`
- **Response**:
  ```json
  { "success": true, "message": "已成功退出登录" }
  ```

### 6.4 `GET /api/check_session.php`

**Description**: Checks whether the current admin session is valid.

- **Auth**: Session-based.
- **Response**:
  - Logged in:
    ```json
    {
      "loggedIn": true,
      "username": "Admin",
      "lastActivity": 1700000000
    }
    ```
  - Not logged in / expired:
    ```json
    {
      "loggedIn": false,
      "session_expired": true,
      "message": "登录已超时，请重新登录"
    }
    ```

---

## 7. Admin Contact Messages

### 7.1 `/api/contact_messages.php`

#### 7.1.1 `GET /api/contact_messages.php`

**Description**: Admin endpoint to list messages stored by the public contact form.

- **Auth**: Required (admin session).
- **Response**:
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

**Description**: Updates TODO metadata for a contact message.

- **Auth**: Required.
- **Request Body**:
  ```json
  {
    "action": "update_todo",
    "message_id": 1,
    "status": "完成",
    "notes": "Customer replied, ticket closed."
  }
  ```
- **Behavior**:
  - When `status` is `"完成"`, marks `is_processed = 1` and sets `processed_at` to current time.
  - Otherwise, `is_processed = 0` and `processed_at = null`.
- **Response**:
  ```json
  {
    "success": true,
    "message": "Todo updated successfully"
  }
  ```

---

## 8. Error Messages & Localization Helpers

While not exposed as dedicated HTTP endpoints, the following utilities affect API behavior:

- `api/error_messages.php`:
  - Provides localized error and success messages for multiple languages (`en`, `fr`, `de`, `es`, `it`).
  - Used by `json_error_response` and `json_success_response` to standardize payloads.
- `get_request_language()`:
  - Determines language from `Accept-Language` header or `lang` query parameter, defaulting to `en`.

These are leveraged by `contact.php`, `translation.php`, and other APIs that surface localized messages.

---

## Notes & Future Work

- This document intentionally avoids over-specifying large, list-based product endpoints in `products.php`.  
  If needed, those can be added as separate subsections (e.g. "Product listing", "Filtering by category/color/season", "Search") based on the same file.
- The actual base HTTP path (e.g. `/api/`) may differ depending on your web server and deployment configuration.


