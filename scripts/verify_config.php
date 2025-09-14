<?php
/**
 * 配置验证脚本
 * 用于验证本地开发与生产环境配置的一致性
 */

// 设置错误报告
error_reporting(E_ALL);
ini_set('display_errors', 1);

// 加载配置
require_once __DIR__ . '/../backend/config/env_loader.php';
require_once __DIR__ . '/../backend/config/environment.php';

echo "=== Dreamoda 配置验证脚本 ===\n\n";

// 加载环境变量
EnvLoader::load();
$env = getEnvironment();

echo "当前环境: " . $env->getEnvironment() . "\n";
echo "是否为开发环境: " . ($env->isDevelopment() ? '是' : '否') . "\n";
echo "是否为生产环境: " . ($env->isProduction() ? '是' : '否') . "\n\n";

// 验证数据库配置
echo "=== 数据库配置 ===\n";
$dbConfig = $env->getDatabaseConfig();
foreach ($dbConfig as $key => $value) {
    if ($key === 'pass') {
        echo "$key: " . (empty($value) ? '(空)' : '***已设置***') . "\n";
    } else {
        echo "$key: $value\n";
    }
}

// 测试数据库连接
echo "\n测试数据库连接...\n";
try {
    $conn = new mysqli($dbConfig['host'], $dbConfig['user'], $dbConfig['pass'], $dbConfig['name'], $dbConfig['port']);
    if ($conn->connect_error) {
        echo "❌ 数据库连接失败: " . $conn->connect_error . "\n";
    } else {
        echo "✅ 数据库连接成功\n";
        $conn->close();
    }
} catch (Exception $e) {
    echo "❌ 数据库连接异常: " . $e->getMessage() . "\n";
}

// 验证上传配置
echo "\n=== 上传配置 ===\n";
$uploadConfig = $env->getUploadConfig();
foreach ($uploadConfig as $key => $value) {
    if (is_array($value)) {
        echo "$key: " . implode(', ', $value) . "\n";
    } else {
        echo "$key: $value\n";
    }
}

// 验证上传目录
$uploadDir = dirname(__DIR__) . '/' . $uploadConfig['upload_dir'];
echo "\n上传目录: $uploadDir\n";
if (is_dir($uploadDir)) {
    echo "✅ 上传目录存在\n";
} else {
    echo "❌ 上传目录不存在\n";
}

// 验证CORS配置
echo "\n=== CORS配置 ===\n";
$corsConfig = $env->getCorsConfig();
echo "允许的来源: " . implode(', ', $corsConfig['allowed_origins']) . "\n";
echo "允许的方法: " . $corsConfig['allowed_methods'] . "\n";
echo "允许的头部: " . $corsConfig['allowed_headers'] . "\n";

// 验证缓存配置
echo "\n=== 缓存配置 ===\n";
$cacheConfig = $env->getCacheConfig();
foreach ($cacheConfig as $key => $value) {
    echo "$key: " . ($value ? '启用' : '禁用') . "\n";
}

// 验证日志配置
echo "\n=== 日志配置 ===\n";
$logConfig = $env->getLogConfig();
foreach ($logConfig as $key => $value) {
    echo "$key: $value\n";
}

// 验证日志目录
$logDir = dirname(dirname(__DIR__)) . '/storage/logs';
echo "\n日志目录: $logDir\n";
if (is_dir($logDir)) {
    echo "✅ 日志目录存在\n";
} else {
    echo "❌ 日志目录不存在\n";
}

// 验证环境变量
echo "\n=== 环境变量验证 ===\n";
$requiredVars = [
    'DB_HOST' => '数据库主机',
    'DB_USER' => '数据库用户',
    'DB_PASS' => '数据库密码',
    'DB_NAME' => '数据库名称',
    'ADMIN_USERNAME' => '管理员用户名',
    'ADMIN_PASSWORD_HASH' => '管理员密码哈希'
];

$missingVars = [];
foreach ($requiredVars as $var => $description) {
    $value = EnvLoader::get($var);
    if (empty($value) || $value === "your_{$var}_here") {
        $missingVars[] = "$var ($description)";
        echo "❌ $var: 未设置或使用默认值\n";
    } else {
        echo "✅ $var: 已设置\n";
    }
}

if (!empty($missingVars)) {
    echo "\n⚠️  警告: 以下环境变量需要配置:\n";
    foreach ($missingVars as $var) {
        echo "   - $var\n";
    }
    echo "\n请编辑 .env 文件并设置正确的值。\n";
}

// 验证API密钥
echo "\n=== API密钥验证 ===\n";
$openaiKey = EnvLoader::get('OPENAI_API_KEY');
if (empty($openaiKey) || $openaiKey === 'your_openai_api_key_here') {
    echo "⚠️  OPENAI_API_KEY: 未设置或使用默认值\n";
    echo "   翻译功能可能无法正常工作\n";
} else {
    echo "✅ OPENAI_API_KEY: 已设置\n";
}

// 总结
echo "\n=== 验证总结 ===\n";
if (empty($missingVars)) {
    echo "✅ 所有必需配置都已正确设置\n";
} else {
    echo "❌ 发现 " . count($missingVars) . " 个配置问题需要解决\n";
}

echo "\n验证完成！\n";
?>
