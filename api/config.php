<?php
// api/config.php

// 数据库配置
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'DreaModa');

// 管理员密码 (使用 password_hash() 生成)
// 默认密码是: admin
define('ADMIN_PASSWORD_HASH', '$2y$10$bqXiQg5/wn0zYQ3z/ToAhuBAMXhXK/7Iqmp9PkjXSBBOMeBZevYEy');

// 上传目录配置
define('UPLOAD_DIR', dirname(__DIR__) . '/images/');
// 上传允许的扩展名
if (!defined('UPLOAD_ALLOWED_EXTS')) {
    define('UPLOAD_ALLOWED_EXTS', ['jpg','jpeg','png','gif','webp']);
}
?>