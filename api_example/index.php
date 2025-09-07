<?php
// API入口文件 - index.php
// 此文件应放置在 public_html/api/ 目录下

// 设置错误报告
error_reporting(E_ALL);
ini_set('display_errors', 1);

// 设置响应头
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// 处理预检请求
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 包含数据库配置
require_once 'config/database.php';

// 获取请求路径
$requestUri = $_SERVER['REQUEST_URI'];
$path = parse_url($requestUri, PHP_URL_PATH);
$path = str_replace('/api', '', $path); // 移除/api前缀
$pathSegments = explode('/', trim($path, '/'));

$method = $_SERVER['REQUEST_METHOD'];
$endpoint = $pathSegments[0] ?? '';

// 通用响应函数
function jsonResponse($success, $data = null, $message = '', $code = 200) {
    http_response_code($code);
    echo json_encode([
        'success' => $success,
        'data' => $data,
        'message' => $message,
        'timestamp' => date('Y-m-d H:i:s')
    ], JSON_UNESCAPED_UNICODE);
    exit();
}

// 路由处理
try {
    switch ($endpoint) {
        case 'products':
            require_once 'endpoints/products.php';
            break;
            
        case 'inquiries':
            require_once 'endpoints/inquiries.php';
            break;
            
        case 'categories':
            require_once 'endpoints/categories.php';
            break;
            
        case 'health':
            // 健康检查端点
            jsonResponse(true, ['status' => 'healthy'], 'API运行正常');
            break;
            
        default:
            jsonResponse(false, null, '端点不存在', 404);
            break;
    }
} catch (Exception $e) {
    jsonResponse(false, null, '服务器内部错误: ' . $e->getMessage(), 500);
}
?>