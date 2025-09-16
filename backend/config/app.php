<?php
/**
 * Dreamoda E-commerce Platform - 统一配置文件
 * 支持开发和生产环境的统一配置管理
 */

// 加载环境变量配置
require_once __DIR__ . '/env_loader.php';
EnvLoader::load();

// 加载环境适配器
require_once __DIR__ . '/environment_adapter.php';

// 初始化环境适配器
$env = getEnvironmentAdapter();
$is_production = $env->isProduction();

// 应用环境设置
applyEnvironmentSettings();

// 错误日志配置
ini_set('error_log', __DIR__ . '/../logs/php_errors.log');

// 数据库配置 - 使用环境适配器
$dbConfig = $env->getDatabaseConfig();
define('DB_HOST', $dbConfig['host']);
define('DB_USER', $dbConfig['user']);
define('DB_PASS', $dbConfig['pass']);
define('DB_NAME', $dbConfig['name']);
define('DB_PORT', $dbConfig['port']);
define('DB_CHARSET', $dbConfig['charset']);

// 管理员密码 - 从环境变量读取
define('ADMIN_USERNAME', EnvLoader::get('ADMIN_USERNAME', 'admin'));
define('ADMIN_PASSWORD_HASH', EnvLoader::get('ADMIN_PASSWORD_HASH', '$2y$10$bqXiQg5/wn0zYQ3z/ToAhuBAMXhXK/7Iqmp9PkjXSBBOMeBZevYEy'));

// 图片路径配置 - 使用环境适配器
$uploadConfig = $env->getUploadConfig();
$uploadDir = $uploadConfig['upload_dir'];
define('IMAGES_BASE_DIR', dirname(__DIR__, 2) . '/' . $uploadDir . '/');
define('IMAGES_PRODUCTS_DIR', IMAGES_BASE_DIR . 'product_images/');
define('IMAGES_CATEGORIES_DIR', IMAGES_BASE_DIR . 'categories/');
define('IMAGES_UPLOADS_DIR', IMAGES_BASE_DIR . 'uploads/');

// 上传目录配置
define('UPLOAD_DIR', IMAGES_PRODUCTS_DIR);

// 上传允许的扩展名
define('UPLOAD_ALLOWED_EXTS', $uploadConfig['allowed_exts']);

// 上传文件大小限制
define('MAX_UPLOAD_SIZE', $uploadConfig['max_size']);

// 图片URL路径配置
define('IMAGES_BASE_URL', '/' . $uploadDir . '/');
define('IMAGES_PRODUCTS_URL', IMAGES_BASE_URL . 'product_images/');
define('IMAGES_CATEGORIES_URL', IMAGES_BASE_URL . 'categories/');
define('IMAGES_UPLOADS_URL', IMAGES_BASE_URL . 'uploads/');

// 网站基础配置 - 从环境变量读取
define('SITE_NAME', EnvLoader::get('SITE_NAME', 'DreaModa Fashion Collection'));
define('SITE_URL', EnvLoader::get('SITE_URL', 'http://localhost'));
define('FRONTEND_URL', EnvLoader::get('FRONTEND_URL', 'http://localhost'));
define('API_BASE_URL', EnvLoader::get('API_BASE_URL', 'http://localhost/api'));

// 安全配置 - 从环境变量读取
define('SESSION_SECRET', EnvLoader::get('SESSION_SECRET', 'default_session_secret'));
define('ENCRYPTION_KEY', EnvLoader::get('ENCRYPTION_KEY', 'default_encryption_key'));

// CORS配置 - 使用环境适配器
$corsConfig = $env->getCorsConfig();
define('CORS_ALLOWED_ORIGINS', $corsConfig['allowed_origins']);
define('CORS_ALLOWED_METHODS', $corsConfig['allowed_methods']);
define('CORS_ALLOWED_HEADERS', $corsConfig['allowed_headers']);

// ===========================================
// 会话管理配置
// ===========================================

/**
 * 配置会话参数以支持长期登录
 */
function configure_long_term_session() {
    // 显式引入环境标志
    global $is_production;

    // 会话生命周期：30天
    $lifetime = 30 * 24 * 60 * 60;

    // 垃圾回收与 cookie 生命周期
    ini_set('session.gc_maxlifetime', (string)$lifetime);

    // 统一设置安全的 Cookie 参数（PHP >= 7.3 数组形式）
    $cookieParams = [
        'lifetime' => $lifetime,
        'path' => '/',
        'domain' => '',
        'secure' => $is_production ? true : false,
        'httponly' => true,
        'samesite' => 'Lax'
    ];
    if (function_exists('session_set_cookie_params')) {
        session_set_cookie_params($cookieParams);
    }

    // 启动会话（避免重复启动）
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    // 为 CSRF 提供一次性 token（如不存在则生成）
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }

    // 更新管理员最后活动时间
    if (!empty($_SESSION['admin_logged_in'])) {
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

// ===========================================
// 数据库连接函数
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
        
        $conn->set_charset(DB_CHARSET);
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
    if (!$is_production) {
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