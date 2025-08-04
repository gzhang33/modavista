<?php
// api/config.example.php
// 配置文件模板 - 复制为 config.php 并填入实际值

// 数据库配置
define('DB_SERVER', 'localhost');
define('DB_USERNAME', 'your_db_username');
define('DB_PASSWORD', 'your_db_password');
define('DB_NAME', 'your_db_name');

// 管理员密码 (使用 password_hash() 生成)
// 请使用 password_hash('your_password', PASSWORD_BCRYPT) 生成新的哈希值
define('ADMIN_PASSWORD_HASH', 'your_generated_password_hash');

// 目录配置
define('UPLOAD_DIR', '../images/');
?>