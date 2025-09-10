<?php
// api/check_session.php
require_once 'config.php';
require_once 'utils.php';
require_once 'session_config.php';

header("Content-Type: application/json; charset=UTF-8");

// 配置长期会话
configure_long_term_session();

if (is_session_valid()) {
    json_response(200, [
        'loggedIn' => true, 
        'username' => $_SESSION['admin_username'] ?? 'Admin',
        'lastActivity' => $_SESSION['last_activity'] ?? time()
    ]);
} else {
    json_response(401, [
        'loggedIn' => false,
        'session_expired' => true,
        'message' => '登录已超时，请重新登录'
    ]);
}
?> 