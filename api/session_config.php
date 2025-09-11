<?php
// api/session_config.php - 会话配置管理

/**
 * 配置会话参数以支持长期登录
 */
function configure_long_term_session() {
    // 设置会话cookie生命周期为30天（秒）
    $lifetime = 30 * 24 * 60 * 60; // 30天
    
    // 设置会话垃圾回收最大生命周期为30天
    ini_set('session.gc_maxlifetime', $lifetime);
    
    // 设置会话cookie参数（兼容旧版PHP）
    session_set_cookie_params(
        $lifetime,
        '/',
        '',
        false, // 在开发环境中设为false，生产环境应设为true
        true   // httponly
    );
    
    // 启动会话（避免重复启动）
    if (session_status() == PHP_SESSION_NONE) {
        session_start();
    }
    
    // 更新会话的最后活动时间
    if (isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true) {
        $_SESSION['last_activity'] = time();
    }
}

/**
 * 检查会话是否有效（考虑长期登录）
 */
function is_session_valid() {
    if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
        return false;
    }
    
    // 检查最后活动时间（30天无活动则过期）
    $max_inactivity = 30 * 24 * 60 * 60; // 30天
    if (isset($_SESSION['last_activity'])) {
        if (time() - $_SESSION['last_activity'] > $max_inactivity) {
            return false;
        }
    }
    
    // 更新最后活动时间
    $_SESSION['last_activity'] = time();
    return true;
}

/**
 * 增强的认证检查函数
 */
function require_auth_enhanced() {
    configure_long_term_session();
    
    if (!is_session_valid()) {
        // 清除无效会话
        $_SESSION = array();
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000,
                $params["path"], $params["domain"],
                $params["secure"], $params["httponly"]
            );
        }
        session_destroy();
        
        json_response(401, [
            "message" => "登录已超时，请重新登录",
            "session_expired" => true
        ]);
    }
}
?>
