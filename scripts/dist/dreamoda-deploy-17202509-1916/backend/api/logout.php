<?php
session_start();
// api/logout.php
require_once '../config/app.php';
require_once 'utils.php';

// 仅允许 POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(405, ['success' => false, 'message' => 'Method Not Allowed']);
}

// CSRF 校验
$csrf = $_POST['csrf_token'] ?? ($_SERVER['HTTP_X_CSRF_TOKEN'] ?? null);
if (empty($csrf) || !hash_equals($_SESSION['csrf_token'] ?? '', $csrf)) {
    json_response(403, ['success' => false, 'message' => 'CSRF token invalid']);
}

// 销毁所有 session 数据
$_SESSION = array();

// 同时删除 session cookie
if (ini_get('session.use_cookies')) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params['path'], $params['domain'],
        $params['secure'], $params['httponly']
    );
}

// 最后，销毁 session
session_destroy();

json_response(200, ['success' => true, 'message' => '已成功退出登录']);
?>