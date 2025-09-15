<?php
// api/utils.php

/**
 * 发送统一格式的 JSON 响应
 *
 * @param int $status_code HTTP 状态码
 * @param array $data 响应数据
 */
function json_response($status_code, $data) {
    // 清理输出缓冲，防止任何意外输出
    if (ob_get_level()) {
        ob_clean();
    }
    
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
    // 尝试加载增强的会话配置
    if (file_exists(__DIR__ . '/session_config.php')) {
        // 会话配置已合并到 config.php 中
        require_auth_enhanced();
        return;
    }
    
    // 回退到原有逻辑
    // 检查会话是否已启动
    if (session_status() == PHP_SESSION_NONE) {
        session_start();
    }

    // 检查管理员登录状态
    if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
        json_response(401, ["message" => "未授权的访问，请先登录"]);
    }
}

// 数据库连接函数已移至 backend/config/app.php

/**
 * 获取默认站点语言（locales 表 sort_order 最小的记录），回退 en-GB
 * @return string 默认 locale 代码，如 en-GB
 */
function get_default_locale() {
    $conn = get_db_connection();
    $res = $conn->query("SELECT code FROM locales ORDER BY sort_order ASC LIMIT 1");
    if ($res && ($row = $res->fetch_assoc())) {
        return $row['code'];
    }
    return 'en-GB';
}

/**
 * 规范化语言代码：接受全码(en-GB)或两位(en)，返回站点支持的完整 locale 代码
 * @param string|null $code
 * @return string 支持的完整 locale 代码
 */
function normalize_language_code($code) {
    $conn = get_db_connection();

    if (!$code || trim($code) === '') {
        return get_default_locale();
    }

    $code = trim($code);

    // 精确匹配 locales.code
    $stmt = $conn->prepare("SELECT code FROM locales WHERE code = ? LIMIT 1");
    $stmt->bind_param('s', $code);
    $stmt->execute();
    $res = $stmt->get_result();
    if ($res && ($row = $res->fetch_assoc())) {
        $stmt->close();
        return $row['code'];
    }
    $stmt->close();

    // 两位前缀匹配，如 en -> en-GB, it -> it-IT
    $prefix = substr($code, 0, 2);
    $like = $prefix . '-%';
    $stmt2 = $conn->prepare("SELECT code FROM locales WHERE code LIKE ? ORDER BY sort_order ASC LIMIT 1");
    $stmt2->bind_param('s', $like);
    $stmt2->execute();
    $res2 = $stmt2->get_result();
    if ($res2 && ($row2 = $res2->fetch_assoc())) {
        $stmt2->close();
        return $row2['code'];
    }
    $stmt2->close();

    // 回退默认
    return get_default_locale();
}

?>