<?php
session_start();
// api/colors.php
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
        get_colors($conn);
        break;
    case 'POST':
        add_color($conn);
        break;
    case 'DELETE':
        delete_color($conn);
        break;
    default:
        json_response(405, ["message" => "不支持的方法"]);
        break;
}

$conn->close();

function get_colors($conn) {
    // 语言参数：en | zh | it，默认 en
    $lang = isset($_GET['lang']) ? strtolower(trim($_GET['lang'])) : 'en';
    if (!in_array($lang, ['en', 'zh', 'it'], true)) { $lang = 'en'; }

    // 选择排序列，避免 NULL 导致排序异常，优先使用对应语言名，否则回退英文
    $sql = 'SELECT id, color_name, color_name_zh, color_name_it, color_code FROM colors ORDER BY 
            CASE WHEN (? = "zh") THEN COALESCE(color_name_zh, color_name)
                 WHEN (? = "it") THEN COALESCE(color_name_it, color_name)
                 ELSE color_name END ASC';
    $stmt = $conn->prepare($sql);
    if ($stmt === false) {
        json_response(500, ["message" => "查询准备失败: " . $conn->error]);
    }
    $stmt->bind_param('ss', $lang, $lang);
    if (!$stmt->execute()) {
        json_response(500, ["message" => "查询执行失败: " . $stmt->error]);
    }
    $result = $stmt->get_result();
    $colors = [];
    while ($row = $result->fetch_assoc()) {
        // 组装多语言
        $name_en = $row['color_name'];
        $name_zh = $row['color_name_zh'] ?? null;
        $name_it = $row['color_name_it'] ?? null;
        $name = $lang === 'zh' ? ($name_zh ?: $name_en) : ($lang === 'it' ? ($name_it ?: $name_en) : $name_en);
        $colors[] = [
            'id' => (int)$row['id'],
            'name' => $name,
            'code' => $row['color_code'],
            'names' => [
                'en' => $name_en,
                'zh' => $name_zh ?: $name_en,
                'it' => $name_it ?: $name_en,
            ],
        ];
    }
    $stmt->close();
    json_response(200, $colors);
}

function add_color($conn) {
    $data = json_decode(file_get_contents("php://input"), true);
    $name = $data['name'] ?? null; // 英文名（兼容原接口）
    $name_zh = $data['name_zh'] ?? null;
    $name_it = $data['name_it'] ?? null;
    $code = $data['code'] ?? null;

    if (empty($name)) {
        json_response(400, ['message' => '颜色名称不能为空']);
    }
    
    // 检查是否已存在
    $check = $conn->prepare('SELECT id FROM colors WHERE color_name = ?');
    $check->bind_param('s', $name);
    $check->execute();
    $res = $check->get_result();
    if ($res->fetch_assoc()) {
        $check->close();
        json_response(200, ['message' => "颜色已存在"]);
    }
    $check->close();

    // 支持多语言字段的插入（列可能在迁移前不存在，若不存在会报错，需先执行迁移脚本）
    $ins = $conn->prepare('INSERT INTO colors (color_name, color_name_zh, color_name_it, color_code) VALUES (?, ?, ?, ?)');
    if ($ins === false) {
        json_response(500, ['message' => '创建颜色失败: ' . $conn->error]);
    }
    $ins->bind_param('ssss', $name, $name_zh, $name_it, $code);
    $ins->execute();
    $id = $ins->insert_id;
    $ins->close();
    json_response(201, ['message' => "颜色 '{$name}' 添加成功", 'id' => (int)$id]);
}

function delete_color($conn) {
    $data = json_decode(file_get_contents("php://input"), true);
    $name = $data['name'] ?? null;

    if (empty($name)) {
        json_response(400, ['message' => '要删除的颜色名称不能为空']);
    }
    
    $del = $conn->prepare('DELETE FROM colors WHERE color_name = ?');
    if ($del === false) {
        json_response(500, ['message' => '删除失败: ' . $conn->error]);
    }
    $del->bind_param('s', $name);
    $del->execute();
    $affected = $del->affected_rows;
    $del->close();
    if ($affected > 0) {
        json_response(200, ['message' => "颜色 '{$name}' 删除成功"]);
    } else {
        json_response(404, ['message' => '颜色未找到']);
    }
}
?>
