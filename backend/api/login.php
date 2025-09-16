<?php
// api/login.php
require_once '../config/app.php';
require_once 'utils.php';

// 配置长期会话
configure_long_term_session();

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
// 简单防爆破：基于 IP 的失败计数（10 分钟窗口，失败 5 次锁定）
$client_ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$rate_key = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'login_fail_' . md5($client_ip);
$lock_key = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'login_lock_' . md5($client_ip);

// 若处于锁定窗口，直接拒绝
if (file_exists($lock_key)) {
    $locked_until = (int)@file_get_contents($lock_key);
    if (time() < $locked_until) {
        json_response(429, ['success' => false, 'message' => '登录失败次数过多，请稍后再试']);
    } else {
        @unlink($lock_key);
    }
}

if ($username === $correct_username && password_verify($password, ADMIN_PASSWORD_HASH)) {
    // 登录成功，设置 session
    // 会话再生，防会话固定
    if (session_status() === PHP_SESSION_ACTIVE) {
        session_regenerate_id(true);
    }
    $_SESSION['admin_logged_in'] = true;
    $_SESSION['admin_username'] = $username;
    $_SESSION['last_activity'] = time();
    $_SESSION['login_time'] = time();
    // 重置失败计数
    @unlink($rate_key);
    @unlink($lock_key);
    
    json_response(200, ['success' => true, 'message' => '登录成功']);
} else {
    // 登录失败：累计计数并可能锁定
    $fails = 0;
    if (file_exists($rate_key)) {
        $data_raw = @file_get_contents($rate_key);
        $arr = json_decode($data_raw, true) ?: [];
        // 清理 10 分钟前的失败记录
        $now = time();
        $arr = array_values(array_filter($arr, function($ts) use ($now) { return ($now - (int)$ts) < 600; }));
        $fails = count($arr);
    } else {
        $arr = [];
    }
    $arr[] = time();
    @file_put_contents($rate_key, json_encode($arr));
    $fails = count($arr);
    if ($fails >= 5) {
        // 锁定 10 分钟
        @file_put_contents($lock_key, (string)(time() + 600));
    }
    json_response(401, ['success' => false, 'message' => '用户名或密码错误']);
}
?> 