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
    // 语言参数处理：支持所有欧洲语言
    $lang = isset($_GET['lang']) ? strtolower(trim($_GET['lang'])) : 'en';
    $valid_languages = ['en', 'it', 'fr', 'de', 'es', 'pt', 'nl', 'pl'];
    if (!in_array($lang, $valid_languages, true)) { $lang = 'en'; }

    // 构建动态SQL查询以支持所有语言字段
    // 根据实际数据库结构构建查询
    $sql = 'SELECT id, category_name_en, category_name_zh, category_name_it FROM categories ORDER BY category_name_en ASC';
    
    $stmt = $conn->prepare($sql);
    if ($stmt === false) {
        json_response(500, ["message" => "查询准备失败: " . $conn->error]);
    }
    
    if (!$stmt->execute()) {
        json_response(500, ["message" => "查询执行失败: " . $stmt->error]);
    }
    
    $result = $stmt->get_result();
    $categories = [];
    while ($row = $result->fetch_assoc()) {
        $name_en = $row['category_name_en'];
        $localized_name = $name_en; // 默认使用英文
        
        // 根据语言选择本地化名称
        if ($lang === 'zh' && !empty($row['category_name_zh'])) {
            $localized_name = $row['category_name_zh'];
        } elseif ($lang === 'it' && !empty($row['category_name_it'])) {
            $localized_name = $row['category_name_it'];
        }
        
        $categories[] = $localized_name;
    }
    $stmt->close();
    json_response(200, $categories);
}

function add_category($conn) {
    $data = json_decode(file_get_contents("php://input"), true);
    $name = $data['name'] ?? null; // 英文
    $name_zh = $data['name_zh'] ?? null;
    $name_it = $data['name_it'] ?? null;

    if (empty($name)) {
        json_response(400, ['message' => '分类名称不能为空']);
    }
    
    // 新结构：若不存在则创建
    $check = $conn->prepare('SELECT id FROM categories WHERE category_name = ?');
    $check->bind_param('s', $name);
    $check->execute();
    $res = $check->get_result();
    if ($res->fetch_assoc()) {
        $check->close();
        json_response(200, ['message' => "分类已存在"]);
    }
    $check->close();

    $ins = $conn->prepare('INSERT INTO categories (category_name, category_name_zh, category_name_it) VALUES (?, ?, ?)');
    if ($ins === false) {
        json_response(500, ['message' => '创建分类失败: ' . $conn->error]);
    }
    $ins->bind_param('sss', $name, $name_zh, $name_it);
    $ins->execute();
    $id = $ins->insert_id;
    $ins->close();
    json_response(201, ['message' => "分类 '{$name}' 添加成功", 'id' => (int)$id]);
}

function delete_category($conn) {
    $data = json_decode(file_get_contents("php://input"), true);
    $name = $data['name'] ?? null;

    if (empty($name)) {
        json_response(400, ['message' => '要删除的分类名称不能为空']);
    }
    
    $del = $conn->prepare('DELETE FROM categories WHERE category_name = ?');
    if ($del === false) {
        json_response(500, ['message' => '删除失败: ' . $conn->error]);
    }
    $del->bind_param('s', $name);
    $del->execute();
    $affected = $del->affected_rows;
    $del->close();
    if ($affected > 0) {
        json_response(200, ['message' => "分类 '{$name}' 删除成功"]);
    } else {
        json_response(404, ['message' => '分类未找到']);
    }
}
?> 