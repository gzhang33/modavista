<?php
// 数据库配置文件 - config/database.php
// 根据Hostinger提供的数据库信息修改以下配置

$host = 'localhost'; // Hostinger通常使用localhost
$dbname = 'your_database_name'; // 替换为您的数据库名称
$username = 'your_database_user'; // 替换为您的数据库用户名
$password = 'your_database_password'; // 替换为您的数据库密码

// 数据库连接选项
$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
];

try {
    $pdo = new PDO(
        "mysql:host=$host;dbname=$dbname;charset=utf8mb4", 
        $username, 
        $password, 
        $options
    );
} catch (PDOException $e) {
    // 生产环境中应该记录错误而不是直接输出
    error_log("数据库连接失败: " . $e->getMessage());
    
    header('Content-Type: application/json; charset=utf-8');
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'data' => null,
        'message' => '数据库连接失败',
        'timestamp' => date('Y-m-d H:i:s')
    ], JSON_UNESCAPED_UNICODE);
    exit();
}

// 设置时区
date_default_timezone_set('Asia/Shanghai');
?>