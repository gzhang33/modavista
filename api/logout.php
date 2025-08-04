<?php
session_start();
// api/logout.php
require_once 'config.php'; // 确保 session_start() 被调用
require_once 'utils.php';

// 销毁所有 session 数据
$_SESSION = array();

// 如果需要，同时删除 session cookie
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}

// 最后，销毁 session
session_destroy();

json_response(200, ['success' => true, 'message' => '已成功退出登录']);
?> 