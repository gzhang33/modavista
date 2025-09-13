<?php
// 数据库连接测试脚本
require_once 'config.php';

echo "<h2>数据库连接测试</h2>";

try {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    
    if ($conn->connect_error) {
        echo "<p style='color: red;'>❌ 数据库连接失败: " . $conn->connect_error . "</p>";
        echo "<p>配置信息:</p>";
        echo "<ul>";
        echo "<li>主机: " . DB_HOST . "</li>";
        echo "<li>用户: " . DB_USER . "</li>";
        echo "<li>数据库: " . DB_NAME . "</li>";
        echo "</ul>";
    } else {
        echo "<p style='color: green;'>✅ 数据库连接成功!</p>";
        
        // 测试查询
        $result = $conn->query("SHOW TABLES");
        if ($result) {
            echo "<p>数据库表列表:</p>";
            echo "<ul>";
            while ($row = $result->fetch_row()) {
                echo "<li>" . $row[0] . "</li>";
            }
            echo "</ul>";
        }
        
        // 测试locales表
        $result = $conn->query("SELECT COUNT(*) as count FROM locales");
        if ($result) {
            $row = $result->fetch_assoc();
            echo "<p>locales表记录数: " . $row['count'] . "</p>";
        }
        
        $conn->close();
    }
} catch (Exception $e) {
    echo "<p style='color: red;'>❌ 异常: " . $e->getMessage() . "</p>";
}

echo "<hr>";
echo "<p><a href='../'>返回首页</a></p>";
?>
