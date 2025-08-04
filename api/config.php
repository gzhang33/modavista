<?php
// api/config.php

// 数据库配置
define('DB_SERVER', 'localhost');
define('DB_USERNAME', 'root');
define('DB_PASSWORD', '');
define('DB_NAME', 'products');

// 管理员密码 (使用 password_hash() 生成)
// 默认密码是: admin
define('ADMIN_PASSWORD_HASH', '$2y$10$bqXiQg5/wn0zYQ3z/ToAhuBAMXhXK/7Iqmp9PkjXSBBOMeBZevYEy');

// 目录配置
define('UPLOAD_DIR', '../images/');
?> 