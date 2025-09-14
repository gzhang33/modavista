<?php
// Simple password check to protect the script from public access.
// REPLACE 'your_secret_password' with a strong, unique password.
if (!isset($_GET['secret']) || $_GET['secret'] !== 'gianni123') {
    http_response_code(403);
    die('Access Denied.');
}

/**
 * Deployment Verification Script
 * 部署完成后运行此脚本验证所有功能正常
 * 简化版本，专注于核心功能验证
 */

// 设置错误报告
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<!DOCTYPE html>";
echo "<html><head><title>Dreamoda 部署验证</title>";
echo "<meta charset='UTF-8'>";
echo "<style>";
echo "body{font-family:Arial,sans-serif;margin:20px;line-height:1.6;}";
echo ".success{color:#28a745;font-weight:bold;}";
echo ".error{color:#dc3545;font-weight:bold;}";
echo ".warning{color:#ffc107;font-weight:bold;}";
echo "h1{color:#333;border-bottom:2px solid #007bff;padding-bottom:10px;}";
echo "h2{color:#495057;border-bottom:1px solid #dee2e6;padding-bottom:5px;margin-top:30px;}";
echo ".summary{background:#e9ecef;padding:15px;border-radius:5px;margin:20px 0;}";
echo ".step{background:#f8f9fa;padding:10px;border-left:4px solid #007bff;margin:10px 0;}";
echo "</style>";
echo "</head><body>";

echo "<h1>🚀 Dreamoda 部署验证</h1>";
echo "<div class='summary'>";
echo "<strong>验证时间:</strong> " . date('Y-m-d H:i:s') . "<br>";
echo "<strong>服务器:</strong> " . ($_SERVER['SERVER_SOFTWARE'] ?? 'Unknown') . "<br>";
echo "<strong>PHP版本:</strong> " . PHP_VERSION . "<br>";
echo "<strong>域名:</strong> " . ($_SERVER['HTTP_HOST'] ?? 'Unknown');
echo "</div>";

$allPassed = true;
$errors = [];
$warnings = [];

// 1. 文件结构检查
echo "<h2>1. 文件结构检查</h2>";

$requiredFiles = [
    'index.html' => '主页文件',
    '.htaccess' => '服务器配置',
    'backend/config/environment_adapter.php' => '环境适配器',
    'backend/api/products.php' => '产品API',
    'backend/admin/login.html' => '管理后台',
    'storage/uploads/' => '上传目录',
    'assets/index.js' => '前端JS文件',
    'assets/index.css' => '前端CSS文件'
];

foreach ($requiredFiles as $file => $description) {
    if (file_exists($file)) {
        if (is_dir($file)) {
            $writable = is_writable($file);
            $status = $writable ? "✅" : "⚠️";
            $class = $writable ? "success" : "warning";
            echo "<div class='$class'>$status $description: 存在" . ($writable ? " (可写)" : " (不可写)") . "</div>";
            if (!$writable) {
                $warnings[] = "$description 目录不可写";
            }
        } else {
            echo "<div class='success'>✅ $description: 存在</div>";
        }
    } else {
        echo "<div class='error'>❌ $description: 不存在</div>";
        $errors[] = "$description 不存在";
        $allPassed = false;
    }
}

// 2. 环境配置检查
echo "<h2>2. 环境配置检查</h2>";

try {
    require_once 'backend/config/env_loader.php';
    require_once 'backend/config/environment_adapter.php';
    
    $adapter = getEnvironmentAdapter();
    echo "<div class='success'>✅ 环境适配器加载成功</div>";
    
    $isProduction = $adapter->isProduction();
    echo "<div class='success'>✅ 当前环境: " . ($isProduction ? "生产环境" : "开发环境") . "</div>";
    
    $dbConfig = $adapter->getDatabaseConfig();
    echo "<div class='success'>✅ 数据库配置已加载</div>";
    
} catch (Exception $e) {
    echo "<div class='error'>❌ 环境配置错误: " . $e->getMessage() . "</div>";
    $errors[] = "环境配置错误: " . $e->getMessage();
    $allPassed = false;
}

// 3. 数据库连接测试
echo "<h2>3. 数据库连接测试</h2>";

try {
    $adapter = getEnvironmentAdapter();
    $dbConfig = $adapter->getDatabaseConfig();
    
    $conn = new mysqli($dbConfig['host'], $dbConfig['user'], $dbConfig['pass'], $dbConfig['name']);
    
    if ($conn->connect_error) {
        echo "<div class='error'>❌ 数据库连接失败: " . $conn->connect_error . "</div>";
        $errors[] = "数据库连接失败: " . $conn->connect_error;
        $allPassed = false;
    } else {
        echo "<div class='success'>✅ 数据库连接成功</div>";
        echo "<div class='success'>✅ 数据库名: " . $dbConfig['name'] . "</div>";
        
        // 检查关键表
        $tables = ['products', 'categories', 'colors', 'materials', 'seasons'];
        $tableStatus = true;
        foreach ($tables as $table) {
            $result = $conn->query("SHOW TABLES LIKE '$table'");
            if ($result && $result->num_rows > 0) {
                $countResult = $conn->query("SELECT COUNT(*) as count FROM $table");
                $count = $countResult ? $countResult->fetch_assoc()['count'] : 0;
                echo "<div class='success'>✅ 表 '$table': 存在 ($count 条记录)</div>";
            } else {
                echo "<div class='error'>❌ 表 '$table': 不存在</div>";
                $tableStatus = false;
                $errors[] = "数据库表 '$table' 不存在";
            }
        }
        
        if (!$tableStatus) {
            $allPassed = false;
        }
    }
    $conn->close();
    
} catch (Exception $e) {
    echo "<div class='error'>❌ 数据库测试失败: " . $e->getMessage() . "</div>";
    $errors[] = "数据库测试失败: " . $e->getMessage();
    $allPassed = false;
}

// 4. API端点快速测试
echo "<h2>4. API端点测试</h2>";

$apiEndpoints = [
    '/backend/api/products.php?limit=1' => '产品API',
    '/backend/api/categories.php' => '分类API',
    '/backend/api/language.php?action=languages' => '语言API'
];

foreach ($apiEndpoints as $endpoint => $description) {
    $url = 'https://' . $_SERVER['HTTP_HOST'] . $endpoint;
    
    $context = stream_context_create([
        'http' => [
            'timeout' => 5,
            'method' => 'GET',
            'header' => 'User-Agent: Dreamoda-Verifier/1.0'
        ]
    ]);
    
    $response = @file_get_contents($url, false, $context);
    
    if ($response !== false) {
        $data = json_decode($response, true);
        if ($data && isset($data['success'])) {
            echo "<div class='success'>✅ $description: 响应正常</div>";
        } else {
            echo "<div class='warning'>⚠️ $description: 响应异常</div>";
            $warnings[] = "$description 响应异常";
        }
    } else {
        echo "<div class='error'>❌ $description: 无法访问</div>";
        $errors[] = "$description 无法访问";
        $allPassed = false;
    }
}

// 5. 部署验证总结
echo "<h2>5. 部署验证总结</h2>";

if ($allPassed) {
    echo "<div class='summary' style='background:#d4edda;border:1px solid #c3e6cb;'>";
    echo "<h3 style='color:#155724;'>🎉 部署验证通过！</h3>";
    echo "<p><strong>网站地址:</strong> <a href='https://" . $_SERVER['HTTP_HOST'] . "' target='_blank'>https://" . $_SERVER['HTTP_HOST'] . "</a></p>";
    echo "<p><strong>管理后台:</strong> <a href='https://" . $_SERVER['HTTP_HOST'] . "/backend/admin/' target='_blank'>https://" . $_SERVER['HTTP_HOST'] . "/backend/admin/</a></p>";
    echo "<p><strong>API测试:</strong> <a href='https://" . $_SERVER['HTTP_HOST'] . "/backend/api/products.php' target='_blank'>https://" . $_SERVER['HTTP_HOST'] . "/backend/api/products.php</a></p>";
    echo "</div>";
} else {
    echo "<div class='summary' style='background:#f8d7da;border:1px solid #f5c6cb;'>";
    echo "<h3 style='color:#721c24;'>❌ 部署验证失败</h3>";
    echo "<p>发现以下错误需要修复:</p>";
    echo "<ul>";
    foreach ($errors as $error) {
        echo "<li style='color:#721c24;'>$error</li>";
    }
    echo "</ul>";
    echo "</div>";
}

if (count($warnings) > 0) {
    echo "<div class='summary' style='background:#fff3cd;border:1px solid #ffeaa7;'>";
    echo "<h3 style='color:#856404;'>⚠️ 警告信息</h3>";
    echo "<ul>";
    foreach ($warnings as $warning) {
        echo "<li style='color:#856404;'>$warning</li>";
    }
    echo "</ul>";
    echo "</div>";
}

// 6. 后续步骤
echo "<h2>6. 后续步骤</h2>";

if ($allPassed) {
    echo "<div class='step'>";
    echo "<h4>✅ 部署成功，请进行以下测试:</h4>";
    echo "<ol>";
    echo "<li>测试网站首页加载</li>";
    echo "<li>测试产品展示功能</li>";
    echo "<li>测试多语言切换</li>";
    echo "<li>测试管理后台登录</li>";
    echo "<li>测试产品上传功能</li>";
    echo "<li>测试移动端响应式设计</li>";
    echo "</ol>";
    echo "</div>";
    
    echo "<div class='step'>";
    echo "<h4>🔧 维护建议:</h4>";
    echo "<ul>";
    echo "<li>定期检查错误日志: <code>storage/logs/php_errors.log</code></li>";
    echo "<li>监控网站性能</li>";
    echo "<li>定期备份数据库</li>";
    echo "<li>更新依赖包</li>";
    echo "</ul>";
    echo "</div>";
} else {
    echo "<div class='step'>";
    echo "<h4>🔧 修复建议:</h4>";
    echo "<ol>";
    echo "<li>检查文件上传是否完整</li>";
    echo "<li>验证数据库连接配置</li>";
    echo "<li>检查文件权限设置</li>";
    echo "<li>查看服务器错误日志</li>";
    echo "</ol>";
    echo "</div>";
}

echo "</body></html>";
?>
