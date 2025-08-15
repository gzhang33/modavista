<?php
// api/utils.php

/**
 * 发送统一格式的 JSON 响应
 *
 * @param int $status_code HTTP 状态码
 * @param array $data 响应数据
 */
function json_response($status_code, $data) {
    header("Content-Type: application/json; charset=UTF-8");
    http_response_code($status_code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit();
}

/**
 * 检查管理员认证状态
 * 如果未登录，则直接输出 401 Unauthorized 并退出
 */
function require_auth() {
    if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
        json_response(401, ["message" => "未授权的访问，请先登录"]);
    }
}
?> 