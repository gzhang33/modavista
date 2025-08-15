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

// 1. 获取最新产品 (按创建时间)
$latest_products = [];
$stmt = $conn->prepare("SELECT v.id AS id,
    CONCAT(p.base_name, ' - ', IFNULL(c.color_name, '')) AS name,
    v.created_at AS createdAt
    FROM product_variants v
    JOIN products p ON v.product_id = p.id
    LEFT JOIN colors c ON v.color_id = c.id
    ORDER BY v.created_at DESC LIMIT 5");
if ($stmt) {
    if ($stmt->execute()) {
        $result = $stmt->get_result();
        while ($row = $result->fetch_assoc()) {
            $latest_products[] = $row;
        }
    }
    $stmt->close();
}

// 2. 获取分类分布
$category_distribution = [];
$stmt = $conn->prepare("SELECT c.category_name AS category, COUNT(p.id) as product_count FROM categories c LEFT JOIN products p ON p.category_id = c.id GROUP BY c.id, c.category_name");
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
$stmt = $conn->prepare("SELECT v.id AS id,
    CONCAT(p.base_name, ' - ', IFNULL(c.color_name, '')) AS name,
    v.created_at AS createdAt
    FROM product_variants v
    JOIN products p ON v.product_id = p.id
    LEFT JOIN colors c ON v.color_id = c.id
    ORDER BY v.created_at DESC LIMIT 5");
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
    'latest_products' => $latest_products,
    'category_distribution' => $category_distribution,
    'recent_updates' => $recent_updates
];

json_response(200, $stats);
?> 