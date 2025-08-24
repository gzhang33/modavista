<?php
session_start();
// api/materials.php
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
        get_materials($conn);
        break;
    case 'POST':
        add_material($conn);
        break;
    case 'DELETE':
        delete_material($conn);
        break;
    default:
        json_response(405, ["message" => "不支持的方法"]);
        break;
}

$conn->close();

function get_materials($conn) {
    // 语言参数处理：en | zh | it
    $lang = isset($_GET['lang']) ? strtolower(trim($_GET['lang'])) : 'en';
    if (!in_array($lang, ['en', 'zh', 'it'], true)) { $lang = 'en'; }

    $sql = 'SELECT id, material_name, material_name_zh, material_name_it FROM materials ORDER BY 
            CASE WHEN (? = "zh") THEN COALESCE(material_name_zh, material_name)
                 WHEN (? = "it") THEN COALESCE(material_name_it, material_name)
                 ELSE material_name END ASC';
    $stmt = $conn->prepare($sql);
    if ($stmt === false) {
        json_response(500, ["message" => "查询准备失败: " . $conn->error]);
    }
    $stmt->bind_param('ss', $lang, $lang);
    if (!$stmt->execute()) {
        json_response(500, ["message" => "查询执行失败: " . $stmt->error]);
    }
    $result = $stmt->get_result();
    $materials = [];
    while ($row = $result->fetch_assoc()) {
        $name_en = $row['material_name'];
        $name_zh = $row['material_name_zh'] ?? null;
        $name_it = $row['material_name_it'] ?? null;
        $name = $lang === 'zh' ? ($name_zh ?: $name_en) : ($lang === 'it' ? ($name_it ?: $name_en) : $name_en);
        // 返回包含英文名和本地化名称的对象
        $materials[] = ['id' => $row['id'], 'name' => $name, 'name_en' => $name_en];
    }
    $stmt->close();
    json_response(200, $materials);
}

function add_material($conn) {
    $data = json_decode(file_get_contents("php://input"), true);
    $name = $data['name'] ?? null; // 英文
    $name_zh = $data['name_zh'] ?? null;
    $name_it = $data['name_it'] ?? null;

    if (empty($name)) {
        json_response(400, ['message' => '材质名称不能为空']);
    }
    
    // 检查是否已存在
    $check = $conn->prepare('SELECT id FROM materials WHERE material_name = ?');
    $check->bind_param('s', $name);
    $check->execute();
    $res = $check->get_result();
    if ($res->fetch_assoc()) {
        $check->close();
        json_response(200, ['message' => "材质已存在"]);
    }
    $check->close();

    $ins = $conn->prepare('INSERT INTO materials (material_name, material_name_zh, material_name_it) VALUES (?, ?, ?)');
    if ($ins === false) {
        json_response(500, ['message' => '创建材质失败: ' . $conn->error]);
    }
    $ins->bind_param('sss', $name, $name_zh, $name_it);
    $ins->execute();
    $id = $ins->insert_id;
    $ins->close();
    json_response(201, ['message' => "材质 '{$name}' 添加成功", 'id' => (int)$id]);
}

function delete_material($conn) {
    $data = json_decode(file_get_contents("php://input"), true);
    $name = $data['name'] ?? null;

    if (empty($name)) {
        json_response(400, ['message' => '要删除的材质名称不能为空']);
    }
    
    $del = $conn->prepare('DELETE FROM materials WHERE material_name = ?');
    if ($del === false) {
        json_response(500, ['message' => '删除失败: ' . $conn->error]);
    }
    $del->bind_param('s', $name);
    $del->execute();
    $affected = $del->affected_rows;
    $del->close();
    if ($affected > 0) {
        json_response(200, ['message' => "材质 '{$name}' 删除成功"]);
    } else {
        json_response(404, ['message' => '材质未找到']);
    }
}
?>
