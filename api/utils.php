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
 * 基于 PHP 会话的认证系统
 */
function require_auth() {
    // 检查会话是否已启动
    if (session_status() == PHP_SESSION_NONE) {
        session_start();
    }

    // 检查管理员登录状态
    if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
        json_response(401, ["message" => "未授权的访问，请先登录"]);
    }
}

/**
 * 获取数据库连接
 */
function get_db_connection() {
    static $conn = null;
    
    if ($conn === null) {
        $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
        
        if ($conn->connect_error) {
            json_response(500, ["error" => "Database connection failed"]);
        }
        
        $conn->set_charset("utf8mb4");
    }
    
    return $conn;
}
?>