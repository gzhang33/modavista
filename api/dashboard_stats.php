<?php
session_start();
// api/dashboard_stats.php
require_once 'config.php';
require_once 'utils.php';

require_auth();

$conn = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);
if ($conn->connect_error) {
    json_response(500, ["message" => "数据库连接失败: " . $conn->connect_error]);
}
$conn->set_charset("utf8mb4");

// 1. 获取热门产品 (按浏览量)
$popular_products_sql = "SELECT id, name, views FROM products ORDER BY views DESC LIMIT 5";
$popular_result = $conn->query($popular_products_sql);
$popular_products = [];
while ($row = $popular_result->fetch_assoc()) {
    $popular_products[] = $row;
}

// 2. 获取分类分布
$category_dist_sql = "SELECT category, COUNT(*) as product_count FROM products GROUP BY category";
$category_result = $conn->query($category_dist_sql);
$category_distribution = [];
while ($row = $category_result->fetch_assoc()) {
    $category_distribution[] = $row;
}

// 3. 获取最近更新的产品
$recent_updates_sql = "SELECT id, name, createdAt FROM products ORDER BY createdAt DESC LIMIT 5";
$recent_result = $conn->query($recent_updates_sql);
$recent_updates = [];
while ($row = $recent_result->fetch_assoc()) {
    $recent_updates[] = $row;
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