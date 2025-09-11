<?php
// api/contact.php
session_start();
require_once 'config.php';
require_once 'utils.php';
require_once 'error_messages.php';

// CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error_response(405, 'METHOD_NOT_ALLOWED');
}

// 简单的速率限制
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$rate_limit_file = sys_get_temp_dir() . '/contact_' . md5($ip);
if (file_exists($rate_limit_file)) {
    $last_time = (int)file_get_contents($rate_limit_file);
    if (time() - $last_time < 60) { // 1分钟内只能发送一次
        json_error_response(429, 'RATE_LIMITED');
    }
}

// 获取POST数据
$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    json_error_response(400, 'INVALID_JSON');
}

// 验证必填字段
$required_fields = ['name', 'email', 'message'];
foreach ($required_fields as $field) {
    if (empty($input[$field])) {
        json_error_response(400, 'REQUIRED_FIELD', ['field' => $field]);
    }
}

// 数据验证和清理
$name = trim($input['name']);
$email = filter_var(trim($input['email']), FILTER_VALIDATE_EMAIL);
$phone = isset($input['phone']) ? trim($input['phone']) : '';
$company = isset($input['company']) ? trim($input['company']) : '';
$message = trim($input['message']);

if (!$email) {
    json_error_response(400, 'INVALID_EMAIL');
}

if (strlen($name) < 2 || strlen($name) > 100) {
    json_error_response(400, 'INVALID_LENGTH', ['min' => 2, 'max' => 100]);
}

if (strlen($message) < 10 || strlen($message) > 1000) {
    json_error_response(400, 'INVALID_LENGTH', ['min' => 10, 'max' => 1000]);
}

// 保存到数据库（可选）
$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
if ($conn->connect_error) {
    error_log('数据库连接失败: ' . $conn->connect_error);
} else {
    $conn->set_charset('utf8mb4');
    
    // 创建联系表（如果不存在）
    $create_table_sql = "
    CREATE TABLE IF NOT EXISTS contact_messages (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        company VARCHAR(100),
        message TEXT NOT NULL,
        ip_address VARCHAR(45),
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ";
    
    if ($conn->query($create_table_sql)) {
        // 插入消息
        $stmt = $conn->prepare("
            INSERT INTO contact_messages (name, email, phone, company, message, ip_address) 
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        $stmt->bind_param('ssssss', $name, $email, $phone, $company, $message, $ip);
        $stmt->execute();
        $stmt->close();
    }
    
    $conn->close();
}

// 发送邮件通知（需要配置邮件服务器）
$email_body = "
新的联系表单消息

姓名: $name
邮箱: $email
电话: $phone
公司: $company

消息:
$message

发送时间: " . date('Y-m-d H:i:s') . "
IP地址: $ip
";

// 如果有邮件配置，可以发送邮件
// mail('Hi@DreaModa.store', '网站联系表单消息', $email_body, 'From: noreply@dreamoda.store');

// 记录速率限制
file_put_contents($rate_limit_file, time());

// 返回成功响应
json_success_response(200, 'CONTACT_SENT_SUCCESS');
?>