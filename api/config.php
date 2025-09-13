<?php
// api/config.php

// 启用错误报告（生产环境调试用）
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../logs/php_errors.log');

// 环境检测
$is_production = !in_array($_SERVER['HTTP_HOST'] ?? '', ['localhost', '127.0.0.1', '::1']);

if ($is_production) {
    // 生产环境配置 (Hostinger)
    define('DB_HOST', 'localhost');  // Hostinger通常使用localhost
    define('DB_USER', 'u705464511_gianni');
    define('DB_PASS', 'V2[qfN+;;5+2');
    define('DB_NAME', 'u705464511_Dreamoda');
} else {
    // 开发环境配置 (本地 XAMPP)
    define('DB_HOST', 'localhost');
    define('DB_USER', 'root');
    define('DB_PASS', '');
    define('DB_NAME', 'DreaModa');
}

// 管理员密码 (使用 password_hash() 生成)
// 默认密码是: admin
define('ADMIN_PASSWORD_HASH', '$2y$10$bqXiQg5/wn0zYQ3z/ToAhuBAMXhXK/7Iqmp9PkjXSBBOMeBZevYEy');

// 图片路径配置
define('IMAGES_BASE_DIR', dirname(__DIR__) . '/product_images/');
define('IMAGES_PRODUCTS_DIR', IMAGES_BASE_DIR . 'products/');
define('IMAGES_CATEGORIES_DIR', IMAGES_BASE_DIR . 'categories/');
define('IMAGES_UPLOADS_DIR', IMAGES_BASE_DIR . 'uploads/');

// 上传目录配置 - 默认保存到products目录
define('UPLOAD_DIR', IMAGES_PRODUCTS_DIR);

// 上传允许的扩展名
if (!defined('UPLOAD_ALLOWED_EXTS')) {
    define('UPLOAD_ALLOWED_EXTS', ['jpg','jpeg','png','gif','webp']);
}

// 图片URL路径配置
define('IMAGES_BASE_URL', '/product_images/');
define('IMAGES_PRODUCTS_URL', IMAGES_BASE_URL . 'products/');
define('IMAGES_CATEGORIES_URL', IMAGES_BASE_URL . 'categories/');
define('IMAGES_UPLOADS_URL', IMAGES_BASE_URL . 'uploads/');
?>