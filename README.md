# Fashion Factory Display System

时尚工厂产品展示系统，专为服装工厂向客户展示产品系列而设计。系统专注于优雅的产品展示和客户互动，而非直接电商功能。

## 📋 目录

- [项目总结](#-项目总结)
- [项目技术栈](#-项目技术栈)
- [快速开始](#-快速开始)
- [配置说明](#-配置说明)
- [许可证](#-许可证)

## 🎯 项目总结

这个系统是服装批发工厂的数字产品目录，主要用途：
- 向潜在客户展示服装系列
- 支持桌面和手机设备浏览
- 方便客户联系我们
- 提供实时产品管理功能
- 通过数据分析跟踪客户互动


## 🛠️ 项目技术栈

### 前端技术
- **HTML5**: 语义化页面结构
- **CSS3**: 现代样式设计，使用CSS变量和BEM方法
- **JavaScript (ES6+)**: 模块化开发，组件化架构

### 后端技术
- **PHP 7+**: 服务器端逻辑
- **MySQL**: 数据库存储
- **mysqli**: 数据库连接，使用预处理语句防SQL注入


## 🚀 快速开始

按照以下步骤在本地机器上运行项目。

### 环境要求
- PHP 7+ 并安装 `mysqli` 扩展
- MySQL 数据库服务器
- Apache 或 Nginx 等网页服务器
- `images/` 目录的写入权限

### 安装步骤

1.  **下载项目**
    ```sh
    git clone https://github.com/your-username/fashion-factory-display.git
    ```
    或下载项目ZIP文件并解压到网页服务器根目录（如XAMPP的 `htdocs`）。

2.  **数据库设置**
    - 在MySQL中创建新数据库（如 `products`）
    - 执行以下SQL查询导入数据库结构（新三表结构）：
      ```sql
      CREATE TABLE categories (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        category_name VARCHAR(100) NOT NULL UNIQUE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

      CREATE TABLE products (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        base_name VARCHAR(255) NOT NULL,
        description TEXT NULL,
        category_id INT UNSIGNED NULL,
        CONSTRAINT fk_products_category
          FOREIGN KEY (category_id) REFERENCES categories(id)
          ON DELETE SET NULL ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

      CREATE TABLE `colors` (
        `id` int(11) UNSIGNED NOT NULL,
        `color_name` varchar(100) NOT NULL COMMENT '颜色名称 (例如: Red, Blue)',
        `color_code` varchar(7) DEFAULT NULL COMMENT '颜色的HEX代码 (例如: #FF0000)'
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='产品颜色表';

      CREATE TABLE `materials` (
        `id` int(11) UNSIGNED NOT NULL,
        `material_name` varchar(100) NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='产品材质表';

      CREATE TABLE `tags` (
        `id` int(11) UNSIGNED NOT NULL,
        `tag_name` varchar(100) NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='产品标签表';

      CREATE TABLE product_variants (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        product_id INT UNSIGNED NOT NULL,
        color_id INT UNSIGNED DEFAULT NULL,
        material_id INT UNSIGNED DEFAULT NULL,
        default_image VARCHAR(255) NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_variants_product
          FOREIGN KEY (product_id) REFERENCES products(id)
          ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT fk_variant_color
          FOREIGN KEY (color_id) REFERENCES colors(id)
          ON DELETE SET NULL ON UPDATE CASCADE,
        CONSTRAINT fk_variant_material
          FOREIGN KEY (material_id) REFERENCES materials(id)
          ON DELETE SET NULL ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

      CREATE TABLE product_media (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        variant_id INT UNSIGNED NOT NULL,
        image_path VARCHAR(255) NOT NULL,
        sort_order INT UNSIGNED NOT NULL DEFAULT 0,
        CONSTRAINT fk_media_variant
          FOREIGN KEY (variant_id) REFERENCES product_variants(id)
          ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

      CREATE TABLE `product_tags` (
        `product_id` int(11) UNSIGNED NOT NULL,
        `tag_id` int(11) UNSIGNED NOT NULL,
        PRIMARY KEY (`product_id`,`tag_id`),
        CONSTRAINT `fk_pt_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
        CONSTRAINT `fk_pt_tag` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='产品与标签的关联表';
      ```

3.  **环境配置**
    - 打开 `api/config.php` 并更新数据库信息（本地 XAMPP 默认配置如下）：
      ```php
      define('DB_HOST', 'localhost');
      define('DB_USER', 'root');
      define('DB_PASS', '');
      define('DB_NAME', 'products');
      ```

4.  **设置权限**
    - 确保网页服务器对 `images/` 目录有写入权限。在Linux/macOS上可以运行：
      ```sh
      chmod 755 images/
      ```

5.  **访问管理后台**
    - 在浏览器中访问 `/admin/login.html`
    - 默认登录信息：
        - **用户名**: `admin`
        - **密码**: `admin`

## 🔧 配置说明

- **数据库**: 所有数据库设置都在 `api/config.php` 中
- **管理员密码**: 生产环境中必须更改默认密码。生成新哈希并更新 `api/config.php` 中的 `ADMIN_PASSWORD_HASH`


## 📄 许可证

本项目专为DreaModa商业使用而设计。
