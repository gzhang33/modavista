<?php
require_once __DIR__ . '/../config/app.php';
configure_long_term_session();

// 已登录则跳转后台首页
if (is_session_valid()) {
    header('Location: dashboard.php', true, 302);
    exit;
}
?>
<?php include __DIR__ . '/login.html'; ?>


