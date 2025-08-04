<?php
session_start();
// api/login.php
require_once 'config.php';
require_once 'utils.php';

header("Access-Control-Allow-Origin: *"); 
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

// 处理 OPTIONS 预检请求
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// 检查请求方法
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(405, ['success' => false, 'message' => '仅支持 POST 方法']);
}

$data = json_decode(file_get_contents("php://input"), true);

$username = $data['username'] ?? '';
$password = $data['password'] ?? '';

// 在真实应用中，用户名也应该从数据库中查询
$correct_username = 'admin'; 

// 验证用户名和密码
if ($username === $correct_username && password_verify($password, ADMIN_PASSWORD_HASH)) {
    // 登录成功，设置 session
    $_SESSION['admin_logged_in'] = true;
    $_SESSION['admin_username'] = $username;
    
    json_response(200, ['success' => true, 'message' => '登录成功']);
} else {
    // 登录失败
    json_response(401, ['success' => false, 'message' => '用户名或密码错误']);
}
?> 