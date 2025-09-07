<?php
// config/hostinger_config.php
// Hostinger 生产环境配置文件

// ===========================================
// 数据库配置 - 请在部署时修改为实际值
// ===========================================

// Hostinger 数据库连接信息（需要在 Hostinger 控制面板获取）
define('DB_HOST', 'localhost');              // 通常是 localhost
define('DB_USER', 'u123456789_dreamoda');    // 替换为您的数据库用户名
define('DB_PASS', 'YourStrongPassword123');  // 替换为您的数据库密码
define('DB_NAME', 'u123456789_dreamoda');    // 替换为您的数据库名

// ===========================================
// 管理员账户配置
// ===========================================

// 管理员密码哈希 (默认密码: admin123)
// 生成新密码: echo password_hash('您的新密码', PASSWORD_DEFAULT);
define('ADMIN_PASSWORD_HASH', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

// ===========================================
// 文件上传配置
// ===========================================

// 图片上传目录（相对于网站根目录）
define('UPLOAD_DIR', dirname(__DIR__) . '/images/');

// 允许的图片格式
if (!defined('UPLOAD_ALLOWED_EXTS')) {
    define('UPLOAD_ALLOWED_EXTS', ['jpg', 'jpeg', 'png', 'gif', 'webp']);
}

// 最大文件大小（字节）- 5MB
define('MAX_FILE_SIZE', 5 * 1024 * 1024);

// ===========================================
// 网站基础配置
// ===========================================

// 网站URL（用于生成绝对链接）
define('SITE_URL', 'https://yourdomain.com');

// 网站名称
define('SITE_NAME', 'DreaModa Fashion Collection');

// 支持的语言
define('SUPPORTED_LOCALES', ['en-GB', 'it-IT', 'zh-CN']);
define('DEFAULT_LOCALE', 'it-IT');

// ===========================================
// React前端应用配置
// ===========================================

// React应用URL
define('FRONTEND_URL', 'https://yourdomain.com');

// API基础URL
define('API_BASE_URL', 'https://yourdomain.com/api');

// 静态资源CDN（可选）
define('STATIC_CDN_URL', 'https://yourdomain.com/assets');

// ===========================================
// API配置
// ===========================================

// API版本
define('API_VERSION', 'v1');

// 分页默认设置
define('DEFAULT_PAGE_SIZE', 20);
define('MAX_PAGE_SIZE', 100);

// 缓存设置
define('API_CACHE_TTL', 3600); // 1小时

// CORS配置
define('CORS_ALLOWED_ORIGINS', ['https://yourdomain.com', 'http://localhost:5173']);
define('CORS_ALLOWED_METHODS', 'GET, POST, PUT, DELETE, OPTIONS');
define('CORS_ALLOWED_HEADERS', 'Content-Type, Authorization, X-Requested-With');

// ===========================================
// 邮件配置（可选）
// ===========================================

// 联系表单邮件接收地址
define('CONTACT_EMAIL', 'Hi@DreaModa.store');

// SMTP配置（如果使用SMTP发送邮件）
define('SMTP_HOST', 'smtp.hostinger.com');
define('SMTP_PORT', 587);
define('SMTP_USERNAME', 'noreply@yourdomain.com');
define('SMTP_PASSWORD', 'YourEmailPassword');

// ===========================================
// 安全配置
// ===========================================

// 会话配置
ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_secure', 1);
ini_set('session.use_strict_mode', 1);

// 错误报告（生产环境关闭详细错误）
if (defined('ENVIRONMENT') && ENVIRONMENT === 'production') {
    error_reporting(0);
    ini_set('display_errors', 0);
    ini_set('log_errors', 1);
    ini_set('error_log', dirname(__DIR__) . '/logs/php_errors.log');
} else {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
}

// ===========================================
// 性能优化配置
// ===========================================

// 启用压缩
if (!ob_get_level()) {
    ob_start('ob_gzhandler');
}

// 设置时区
date_default_timezone_set('Europe/Rome');

// ===========================================
// 工具函数
// ===========================================

/**
 * 获取数据库连接
 */
function get_db_connection() {
    static $conn = null;
    
    if ($conn === null) {
        $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
        
        if ($conn->connect_error) {
            error_log('数据库连接失败: ' . $conn->connect_error);
            die('数据库连接失败，请稍后重试。');
        }
        
        $conn->set_charset('utf8mb4');
    }
    
    return $conn;
}

/**
 * 安全地获取客户端IP地址
 */
function get_client_ip() {
    $ip_keys = ['HTTP_X_FORWARDED_FOR', 'HTTP_X_REAL_IP', 'HTTP_CLIENT_IP', 'REMOTE_ADDR'];
    
    foreach ($ip_keys as $key) {
        if (!empty($_SERVER[$key])) {
            $ip = $_SERVER[$key];
            if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                return $ip;
            }
        }
    }
    
    return $_SERVER['REMOTE_ADDR'] ?? 'unknown';
}

/**
 * 生成安全的随机字符串
 */
function generate_random_string($length = 32) {
    return bin2hex(random_bytes($length / 2));
}

/**
 * 处理CORS请求
 */
function handle_cors() {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    $allowed_origins = CORS_ALLOWED_ORIGINS;
    
    // 在开发环境中允许localhost
    if (defined('ENVIRONMENT') && ENVIRONMENT !== 'production') {
        if (strpos($origin, 'localhost') !== false || strpos($origin, '127.0.0.1') !== false) {
            header('Access-Control-Allow-Origin: ' . $origin);
        }
    } elseif (in_array($origin, $allowed_origins)) {
        header('Access-Control-Allow-Origin: ' . $origin);
    }
    
    header('Access-Control-Allow-Methods: ' . CORS_ALLOWED_METHODS);
    header('Access-Control-Allow-Headers: ' . CORS_ALLOWED_HEADERS);
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400');
    
    // 处理OPTIONS预检请求
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }
}

/**
 * API统一响应格式
 */
function api_response($success, $data = null, $message = '', $code = 200) {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    
    $response = [
        'success' => $success,
        'code' => $code,
        'message' => $message,
        'timestamp' => date('c')
    ];
    
    if ($data !== null) {
        $response['data'] = $data;
    }
    
    echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/**
 * API成功响应
 */
function api_success($data = null, $message = 'Success') {
    api_response(true, $data, $message, 200);
}

/**
 * API错误响应
 */
function api_error($message = 'Error', $code = 400, $data = null) {
    api_response(false, $data, $message, $code);
}

/**
 * 验证API请求频率限制
 */
function check_rate_limit($identifier, $max_requests = 100, $time_window = 3600) {
    $cache_key = 'rate_limit_' . md5($identifier);
    $cache_file = sys_get_temp_dir() . '/' . $cache_key;
    
    $current_time = time();
    $requests = [];
    
    if (file_exists($cache_file)) {
        $requests = json_decode(file_get_contents($cache_file), true) ?: [];
    }
    
    // 清理过期请求
    $requests = array_filter($requests, function($timestamp) use ($current_time, $time_window) {
        return ($current_time - $timestamp) < $time_window;
    });
    
    if (count($requests) >= $max_requests) {
        api_error('请求过于频繁，请稍后重试', 429);
    }
    
    $requests[] = $current_time;
    file_put_contents($cache_file, json_encode($requests));
}

?>