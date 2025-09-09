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
    // 支持两位语言码或完整 locale，统一规范化
    $raw = $_GET['lang'] ?? null;
    $locale = normalize_language_code($raw);

    // 使用新的 i18n 结构查询材质
    $sql = 'SELECT
                m.id,
                COALESCE(mi.name, m.material_name) AS name,
                m.material_name AS name_en
            FROM material m
            LEFT JOIN material_i18n mi ON m.id = mi.material_id AND mi.locale = ?
            ORDER BY COALESCE(mi.name, m.material_name) ASC';

    $stmt = $conn->prepare($sql);
    if ($stmt === false) {
        json_response(500, ["message" => "查询准备失败: " . $conn->error]);
    }
    $stmt->bind_param('s', $locale);
    if (!$stmt->execute()) {
        json_response(500, ["message" => "查询执行失败: " . $stmt->error]);
    }
    $result = $stmt->get_result();
    $materials = [];
    while ($row = $result->fetch_assoc()) {
        $name = $row['name'];
        if (!empty($name) && $name !== null) {
            $materials[] = $name;
        }
    }
    $stmt->close();
    json_response(200, $materials);
}

function add_material($conn) {
    $data = json_decode(file_get_contents("php://input"), true);
    $name = $data['name'] ?? null; // 英文名称
    $translations = $data['translations'] ?? []; // 多语言翻译

    if (empty($name)) {
        json_response(400, ['message' => '材质名称不能为空']);
    }

    // 检查材质是否已存在
    $check = $conn->prepare('SELECT id FROM material WHERE material_name = ?');
    $check->bind_param('s', $name);
    $check->execute();
    $res = $check->get_result();
    if ($res->fetch_assoc()) {
        $check->close();
        json_response(200, ['message' => "材质已存在"]);
    }
    $check->close();

    // 开始事务
    $conn->begin_transaction();

    // 创建主材质记录
    $ins = $conn->prepare('INSERT INTO material (material_name) VALUES (?)');
    if ($ins === false) {
        $conn->rollback();
        json_response(500, ['message' => '创建材质失败: ' . $conn->error]);
    }
    $ins->bind_param('s', $name);
    if (!$ins->execute()) {
        $ins->close();
        $conn->rollback();
        json_response(500, ['message' => '创建材质失败: ' . $conn->error]);
    }
    $material_id = $ins->insert_id;
    $ins->close();

    // 添加英文翻译
    $i18n_stmt = $conn->prepare('INSERT INTO material_i18n (material_id, locale, name) VALUES (?, ?, ?)');
    if (!$i18n_stmt) {
        $conn->rollback();
        json_response(500, ['message' => '创建材质翻译失败: ' . $conn->error]);
    }

    $locale = 'en-GB';
    $i18n_stmt->bind_param('iss', $material_id, $locale, $name);
    if (!$i18n_stmt->execute()) {
        $i18n_stmt->close();
        $conn->rollback();
        json_response(500, ['message' => '创建英文翻译失败: ' . $conn->error]);
    }

    // 添加其他语言翻译
    foreach ($translations as $lang => $translation) {
        if (empty($translation)) continue;

        $locale_map = ['zh' => 'zh-CN', 'it' => 'it-IT'];
        $locale = $locale_map[$lang] ?? null;
        if (!$locale) continue;

        $i18n_stmt->bind_param('iss', $material_id, $locale, $translation);
        if (!$i18n_stmt->execute()) {
            $i18n_stmt->close();
            $conn->rollback();
            json_response(500, ['message' => "创建 {$lang} 翻译失败: " . $conn->error]);
        }
    }
    $i18n_stmt->close();

    $conn->commit();
    json_response(201, ['message' => "材质 '{$name}' 添加成功", 'id' => (int)$material_id]);
}

function delete_material($conn) {
    $data = json_decode(file_get_contents("php://input"), true);
    $name = $data['name'] ?? null;

    if (empty($name)) {
        json_response(400, ['message' => '要删除的材质名称不能为空']);
    }

    // 删除材质（外键约束会自动删除相关的 i18n 记录）
    $del = $conn->prepare('DELETE FROM material WHERE material_name = ?');
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
