<?php
require_once __DIR__ . '/../config/app.php';

// 统一会话配置
configure_long_term_session();

// 统一安全响应头
header('X-Frame-Options: DENY');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: strict-origin-when-cross-origin');
header("Permissions-Policy: camera=(), microphone=(), geolocation=()");
// HSTS 仅在生产环境启用
if ($is_production) {
    header('Strict-Transport-Security: max-age=31536000; includeSubDomains');
}
// 基础 CSP（后台包含必要的内联脚本/样式，放宽为 unsafe-inline；生产可逐步替换为 nonce/hash）
header("Content-Security-Policy: default-src 'self'; script-src 'self' https://cdnjs.cloudflare.com 'unsafe-inline'; style-src 'self' https://cdnjs.cloudflare.com 'unsafe-inline'; img-src 'self' data:; font-src 'self' https://cdnjs.cloudflare.com data:;");

// 禁止缓存，防止后退可见
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');

// 未登录则跳转登录页
if (!is_session_valid()) {
    header('Location: login.php', true, 302);
    exit;
}
?>


