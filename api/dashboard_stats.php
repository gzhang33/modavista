<?php
session_start();
// api/dashboard_stats.php
require_once 'config.php';
require_once 'utils.php';

require_auth();

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
if ($conn->connect_error) {
    json_response(500, ["message" => "数据库连接失败: " . $conn->connect_error]);
}
$conn->set_charset("utf8mb4");

// 1. 获取热门产品 (按浏览量)
$popular_products = [];
$stmt = $conn->prepare("SELECT id, name, views FROM products ORDER BY views DESC LIMIT 5");
if ($stmt) {
    if ($stmt->execute()) {
        $result = $stmt->get_result();
        while ($row = $result->fetch_assoc()) {
            $popular_products[] = $row;
        }
    }
    $stmt->close();
}

// 2. 获取分类分布
$category_distribution = [];
$stmt = $conn->prepare("SELECT category, COUNT(*) as product_count FROM products GROUP BY category");
if ($stmt) {
    if ($stmt->execute()) {
        $result = $stmt->get_result();
        while ($row = $result->fetch_assoc()) {
            $category_distribution[] = $row;
        }
    }
    $stmt->close();
}

// 3. 获取最近更新的产品
$recent_updates = [];
$stmt = $conn->prepare("SELECT id, name, createdAt FROM products ORDER BY createdAt DESC LIMIT 5");
if ($stmt) {
    if ($stmt->execute()) {
        $result = $stmt->get_result();
        while ($row = $result->fetch_assoc()) {
            $recent_updates[] = $row;
        }
    }
    $stmt->close();
}

$conn->close();

// 组合所有统计数据
$stats = [
    'popular_products' => $popular_products,
    'category_distribution' => $category_distribution,
    'recent_updates' => $recent_updates
];

json_response(200, $stats);
?> 