<?php
session_start();
// api/categories.php
require_once 'config.php';
require_once 'utils.php';

// 只对写操作需要认证，读操作允许公开访问
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    require_auth();
}

// 数据库连接
$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
if ($conn->connect_error) {
    json_response(500, ["message" => "数据库连接失败: " . $conn->connect_error]);
}
$conn->set_charset("utf8mb4");

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        get_categories($conn);
        break;
    case 'POST':
        add_category($conn);
        break;
    case 'DELETE':
        delete_category($conn);
        break;
    default:
        json_response(405, ["message" => "不支持的方法"]);
        break;
}

$conn->close();

function get_categories($conn) {
    // 假设我们有一个 categories 表，包含 id 和 name 字段
    // 为了演示，我们先从 products 表中获取所有唯一的分类
    $stmt = $conn->prepare("SELECT DISTINCT category FROM products ORDER BY category ASC");
    if ($stmt === false) {
        json_response(500, ["message" => "查询准备失败: " . $conn->error]);
    }
    if (!$stmt->execute()) {
        json_response(500, ["message" => "查询执行失败: " . $stmt->error]);
    }
    $result = $stmt->get_result();
    $categories = [];
    while ($row = $result->fetch_assoc()) {
        $categories[] = $row['category'];
    }
    $stmt->close();
    json_response(200, $categories);
}

function add_category($conn) {
    $data = json_decode(file_get_contents("php://input"), true);
    $name = $data['name'] ?? null;

    if (empty($name)) {
        json_response(400, ['message' => '分类名称不能为空']);
    }
    
    // 注意：这里只是一个示例。在实际应用中，您应该有一个专门的 `categories` 表
    // 来存储分类，而不是仅仅依赖于 `products` 表。
    // 由于当前没有 `categories` 表，此功能暂时返回成功信息。
    json_response(201, ['message' => "分类 '{$name}' 添加成功（模拟）"]);
}

function delete_category($conn) {
    $data = json_decode(file_get_contents("php://input"), true);
    $name = $data['name'] ?? null;

    if (empty($name)) {
        json_response(400, ['message' => '要删除的分类名称不能为空']);
    }
    
    // 同样，这是一个模拟操作
    json_response(200, ['message' => "分类 '{$name}' 删除成功（模拟）"]);
}
?> 