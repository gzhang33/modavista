<?php
// health-check.php - 系统状态检查

header('Content-Type: application/json');

$health = [
    'status' => 'running',
    'timestamp' => date('Y-m-d H:i:s'),
    'php_version' => PHP_VERSION,
    'components' => []
];

// 检查PHP扩展
$required_extensions = ['mysqli', 'gd', 'curl', 'json'];
foreach ($required_extensions as $ext) {
    $health['components']['php_extensions'][$ext] = extension_loaded($ext) ? 'loaded' : 'missing';
}

// 检查上传目录
$upload_dir = dirname(__FILE__) . '/images/';
$health['components']['upload_directory'] = [
    'path' => $upload_dir,
    'exists' => is_dir($upload_dir),
    'writable' => is_writable($upload_dir)
];

// 检查配置文件
$config_file = dirname(__FILE__) . '/api/config.php';
$health['components']['config'] = [
    'exists' => file_exists($config_file),
    'readable' => is_readable($config_file)
];

// 数据库连接测试（如果可用）
try {
    include_once dirname(__FILE__) . '/api/config.php';
    $mysqli = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    
    if ($mysqli->connect_error) {
        $health['components']['database'] = [
            'status' => 'error',
            'message' => 'Connection refused - Please start Laragon MySQL service'
        ];
    } else {
        $health['components']['database'] = [
            'status' => 'connected',
            'server_info' => $mysqli->server_info
        ];
        $mysqli->close();
    }
} catch (Exception $e) {
    $health['components']['database'] = [
        'status' => 'error',
        'message' => $e->getMessage()
    ];
}

echo json_encode($health, JSON_PRETTY_PRINT);
?>