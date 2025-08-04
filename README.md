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

- **Frontend**: HTML5, CSS3, and Vanilla JavaScript (ES6+).
- **Backend**: PHP 7+ RESTful API.
- **Database**: MySQL.
- **Authentication**: Secure session-based admin login.

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
          id VARCHAR(50) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          category VARCHAR(100),
          media JSON,
          defaultImage VARCHAR(255),
          createdAt DATETIME,
          views INT DEFAULT 0
      );
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
├── api/                    # PHP backend APIs
├── assets/                 # CSS, JavaScript, and libraries
└── images/                 # Uploaded product images
```

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
