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
    $raw = $_GET['lang'] ?? null;
    $locale = normalize_language_code($raw);

    $sql = 'SELECT
                c.id,
                c.category_name_en,
                COALESCE(ci.name, c.category_name_en) AS name
            FROM category c
            LEFT JOIN category_i18n ci ON c.id = ci.category_id AND ci.locale = ?
            ORDER BY COALESCE(ci.name, c.category_name_en) ASC';

    $stmt = $conn->prepare($sql);
    if ($stmt === false) {
        json_response(500, ["message" => "查询准备失败: " . $conn->error]);
    }

    $stmt->bind_param('s', $locale);
    if (!$stmt->execute()) {
        json_response(500, ["message" => "查询执行失败: " . $stmt->error]);
    }

    $result = $stmt->get_result();
    $categories = [];
    while ($row = $result->fetch_assoc()) {
        $categories[] = [
            'id' => $row['id'],
            'name' => $row['name'], // Translated name
            'english_name' => $row['category_name_en'] // English name for image key
        ];
    }
    $stmt->close();
    json_response(200, $categories);
}

function add_category($conn) {
    $data = json_decode(file_get_contents("php://input"), true);
    $name = $data['name'] ?? null; // 英文名称
    $translations = $data['translations'] ?? []; // 多语言翻译

    if (empty($name)) {
        json_response(400, ['message' => '分类名称不能为空']);
    }

    // 检查分类是否已存在
    $check = $conn->prepare('SELECT id FROM category WHERE category_name_en = ?');
    $check->bind_param('s', $name);
    $check->execute();
    $res = $check->get_result();
    if ($res->fetch_assoc()) {
        $check->close();
        json_response(200, ['message' => "分类已存在"]);
    }
    $check->close();

    // 开始事务
    $conn->begin_transaction();

    // 创建主分类记录
    $ins = $conn->prepare('INSERT INTO category (category_name_en) VALUES (?)');
    if ($ins === false) {
        $conn->rollback();
        json_response(500, ['message' => '创建分类失败: ' . $conn->error]);
    }
    $ins->bind_param('s', $name);
    if (!$ins->execute()) {
        $ins->close();
        $conn->rollback();
        json_response(500, ['message' => '创建分类失败: ' . $conn->error]);
    }
    $category_id = $ins->insert_id;
    $ins->close();

    // 添加英文翻译
    $i18n_stmt = $conn->prepare('INSERT INTO category_i18n (category_id, locale, name, slug) VALUES (?, ?, ?, ?)');
    if (!$i18n_stmt) {
        $conn->rollback();
        json_response(500, ['message' => '创建分类翻译失败: ' . $conn->error]);
    }

    $locale = 'en-GB';
    $slug = ''; // 让触发器生成
    $i18n_stmt->bind_param('isss', $category_id, $locale, $name, $slug);
    if (!$i18n_stmt->execute()) {
        $i18n_stmt->close();
        $conn->rollback();
        json_response(500, ['message' => '创建英文翻译失败: ' . $conn->error]);
    }

    // 添加其他语言翻译
    foreach ($translations as $lang => $translation) {
        if (empty($translation)) continue;

        $locale_map = ['en' => 'en-GB', 'it' => 'it-IT'];
        $locale = $locale_map[$lang] ?? null;
        if (!$locale) continue;

        $slug = ''; // 让触发器生成
        $i18n_stmt->bind_param('isss', $category_id, $locale, $translation, $slug);
        if (!$i18n_stmt->execute()) {
            $i18n_stmt->close();
            $conn->rollback();
            json_response(500, ['message' => "创建 {$lang} 翻译失败: " . $conn->error]);
        }
    }
    $i18n_stmt->close();

    $conn->commit();
    json_response(201, ['message' => "分类 '{$name}' 添加成功", 'id' => (int)$category_id]);
}

function delete_category($conn) {
    $data = json_decode(file_get_contents("php://input"), true);
    $name = $data['name'] ?? null;

    if (empty($name)) {
        json_response(400, ['message' => '要删除的分类名称不能为空']);
    }

    // 删除分类（外键约束会自动删除相关的 i18n 记录）
    $del = $conn->prepare('DELETE FROM category WHERE category_name_en = ?');
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