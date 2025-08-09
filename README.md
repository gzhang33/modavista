# 🇮🇹 Fashion Factory Display System

A sophisticated Italian fashion product display system designed for clothing factories to showcase their collections to clients. This system focuses on elegant product presentation and client engagement rather than direct e-commerce functionality.

## 📋 Table of Contents

- [Purpose](#-purpose)
- [Key Features](#-key-features)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Configuration](#-configuration)
- [Customization](#-customization)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [Support](#-support)
- [License](#-license)

## 🎯 Purpose

This system serves as a digital catalog for fashion factories to:
- Showcase clothing collections to potential clients.
- Enable easy browsing on desktop and mobile devices.
- Facilitate client contact and ordering processes.
- Provide real-time product management capabilities.
- Track client engagement through analytics.

## ✨ Key Features

### 🖥️ Public Showcase
- **Elegant Product Display**: Italian fashion-inspired design with category filtering.
- **Responsive Design**: Optimized for both desktop and mobile viewing.
- **Product Details**: High-quality image galleries with detailed descriptions.
- **Contact Integration**: Easy client contact for ordering inquiries.
- **Italian Language**: Native Italian interface for an authentic experience.

### 🛠️ Admin Management
- **Product Management**: Full CRUD operations for the product catalog.
- **Media Library**: Centralized image management with usage tracking.
- **Category Management**: Dynamically organize products by clothing types.
- **Responsive Dashboard**: Manage your store from any device.
- **Variants Builder**: Add multiple color variants in one submission; each color becomes an independent product record with its own media.

### ⚡ Performance & Optimization
- **Image Optimization**: Automatic compression and lazy loading for fast delivery.
- **Performance Monitoring**: Real-time Core Web Vitals tracking in the console.
- **Optimized Loading**: Custom font and resource loading strategies for speed.
- **Lightweight & Fast**: Built for a speedy experience, especially on mobile.

### 🔒 Security
- **Secure Admin**: Session-based authentication for the admin panel.
- **SQL Injection Prevention**: Prepared statements are used to protect the database.
- **Secure File Uploads**: Strict validation and unique naming for all uploaded media.

### 📊 Analytics
- **Dashboard Stats**: Track total products, categories, and media usage.
- **Client Engagement**: View statistics on popular products and categories.

## 🏗️ Architecture

- **Frontend**: HTML5, CSS3, and Vanilla JavaScript (ES6+ Modules).
- **Backend**: PHP 7+ RESTful API.
- **Database**: MySQL.
- **Authentication**: Secure session-based admin login.
- **Module System**: ES6 modules with component-based architecture for maintainability.

### 🧩 Modular Architecture

The public site uses a modern ES6 module-based architecture with clear separation of concerns:

#### **Components Structure**
- **ProductGrid**: Handles product listing, filtering, and navigation on the homepage
- **MobileNavigation**: Manages mobile navigation menu interactions
- **ImageGallery**: Handles product image display, zoom, and thumbnail switching
- **RelatedProducts**: Manages "You might also like" product recommendations
- **ProductDetails**: Displays product information, variants, and breadcrumbs

#### **Utilities**
- **ApiClient**: Centralized HTTP client for all API interactions with error handling and request management

#### **Entry Points**
- **script.js**: Main application coordinator for the homepage (`index.html`)
- **product.js**: Product page coordinator for product details (`product.html`)

#### **Benefits of This Architecture**
- **Maintainability**: Each component has a single responsibility
- **Reusability**: Components can be easily reused across different pages
- **Testability**: Individual components can be tested in isolation
- **Performance**: Selective loading and tree-shaking capabilities
- **Developer Experience**: Clear file naming allows AI tools to quickly understand functionality

## 🚀 Getting Started

Follow these steps to get the project running on your local machine.

### Prerequisites
- PHP 7+ with the `mysqli` extension.
- MySQL database server.
- A web server like Apache or Nginx.
- Write permissions for the `images/` directory.

### Installation Guide

1.  **Clone the Repository**
    ```sh
    git clone https://github.com/your-username/fashion-factory-display.git
    ```
    Or download and extract the project ZIP file into your web server's root directory (e.g., `htdocs` for XAMPP).

2.  **Database Setup**
    - Create a new database in MySQL (e.g., `products`).
    - Import the database schema by executing the following SQL query:
      ```sql
      CREATE TABLE products (
          id VARCHAR(64) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          category VARCHAR(100),
          defaultImage VARCHAR(255),
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          variants LONGTEXT NULL,
          media LONGTEXT NULL,
          views INT(10) UNSIGNED DEFAULT 0,
          archived TINYINT(1) DEFAULT 0
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      ```

3.  **Configure Environment**
    - Open `api/config.php` and update the database credentials:
      ```php
      define('DB_SERVER', 'localhost');
      define('DB_USERNAME', 'your_username');
      define('DB_PASSWORD', 'your_password');
      define('DB_NAME', 'products');
      ```

4.  **Set Permissions**
    - Ensure your web server has write permissions for the `images/` directory. On Linux/macOS, you can run:
      ```sh
      chmod 755 images/
      ```

5.  **Access the Admin Panel**
    - Navigate to `/admin/login.html` in your browser.
    - Default credentials:
        - **Username**: `admin`
        - **Password**: `admin`

## 🔧 Configuration

- **Database**: All database settings are in `api/config.php`.
- **Admin Password**: For production, it is **critical** to change the default password. Generate a new hash and update the `ADMIN_PASSWORD_HASH` in `api/config.php`.

## 🎨 Customization

- **Styling**: Modify CSS custom properties in `assets/css/style.css` to change the theme.
- **Content**: Update contact information and branding in `index.html` and other relevant files.

## 📁 Project Structure
```
htdocs/
├── index.html              # Main product showcase
├── product.html            # Product detail page
├── admin/                  # Admin dashboard & login
│   ├── assets/             # Admin-specific assets
│   │   ├── css/            # Admin stylesheets
│   │   ├── js/             # Admin JavaScript files
│   │   │   └── components/ # Admin UI components
│   │   └── lib/            # Admin-specific libraries
│   ├── components/         # Admin PHP components
│   ├── dashboard.php       # Main admin dashboard
│   └── login.html          # Admin login page
├── api/                    # PHP backend APIs
├── assets/                 # Public site assets
│   ├── css/                # Public stylesheets
│   ├── js/                 # Public JavaScript files (ES6 Modules)
│   │   ├── components/     # Modular UI components
│   │   │   ├── ProductGrid.js        # Product listing component
│   │   │   ├── MobileNavigation.js   # Mobile navigation component
│   │   │   ├── ImageGallery.js       # Product image gallery
│   │   │   ├── RelatedProducts.js    # Related products component
│   │   │   └── ProductDetails.js     # Product detail component
│   │   ├── utils/          # Utility functions and tools
│   │   │   └── apiClient.js          # Centralized API client
│   │   ├── lib/            # Public site libraries
│   │   ├── script.js       # Main app entry point (homepage)
│   │   └── product.js      # Product page entry point
└── images/                 # Uploaded product images
```

## 📚 Libraries Policy

- **Public Site Libraries**: `assets/js/lib/` stores JavaScript libraries for the public site.
- **Admin Libraries**: `admin/assets/lib/` stores JavaScript libraries for the admin dashboard.
- **Introduction Principle**: Prefer no new external libraries to keep the project lightweight.
- **Exception (By Discussion)**: For complex UI components (e.g., data tables), after discussion, you may introduce a lightweight, dependency-free, pure JavaScript library (such as Grid.js) to enhance efficiency and robustness.
- **Documentation**: Any introduced library must be recorded in the section below.

### Libraries Used

- None at present. If a library is added (e.g., Grid.js for tables), list its name, version, source URL, and purpose here.

## 🤝 Contributing

This project is a solid foundation. Areas for enhancement include:
- Additional language support.
- Advanced analytics features.
- Integration with external client management systems.

## 🆘 Support

If you encounter issues:
1.  Review the `COMMON ISSUES & SOLUTIONS` section in the `.cursorrules` file.
2.  Double-check that all installation steps and permissions are correct.
3.  Ensure your server environment meets the prerequisites.

## 📄 License

This project is designed for commercial use by fashion factories and manufacturers.

## 🧩 Variants & Color Swatches

- Each color variant is stored as an independent row in `products` (no separate parent/child tables).
- When creating a product from the admin panel, you can add multiple variants in the “颜色变体” section. For each variant:
  - Specify a color name (e.g., Red/Blue/Black)
  - Upload one or more images (they become the variant’s `media` and `defaultImage`)
- The API `POST /api/products.php` accepts a batch-creation payload using:
  - `variants_meta`: JSON string like `[{"index":0,"color":"Red"},{"index":1,"color":"Blue"}]`
  - `variant_media_{index}[]`: Files for each variant (e.g., `variant_media_0[]`)
- Frontend behaviors:
  - Home grid: cards show mini color swatches; hovering/clicking switches the card preview image to that variant.
  - Detail page: color swatches update the gallery and product info without page reload.

## 🧪 Notes on Naming

- To improve automatic grouping of variants, keep a stable base name for a style and put the color at the end, for example:
  - `Blazer - Red`, `Blazer (Blue)`, or `Blazer | Black`.
- The system infers the base name by removing trailing color markers `(...)`, `- Color`, or `| Color`.
