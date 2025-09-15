<?php
session_start();
// api/categories.php
require_once '../config/app.php';
require_once 'utils.php';

// 只对写操作需要认证，读操作允许公开访问
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    require_auth();
}

// 数据库连接
try {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    if ($conn->connect_error) {
        error_log("Categories API - Database connection failed: " . $conn->connect_error);
        json_response(500, ["message" => "数据库连接失败: " . $conn->connect_error]);
    }
    $conn->set_charset("utf8mb4");
} catch (Exception $e) {
    error_log("Categories API - Database connection exception: " . $e->getMessage());
    json_response(500, ["message" => "数据库连接异常"]);
}

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
    
    // 改进语言代码处理：支持简短格式和完整locale格式
    if ($raw) {
        // 如果已经是完整格式 (en-GB, it-IT)，直接使用
        if (strpos($raw, '-') !== false) {
            $locale = $raw;
        } else {
            // 如果是简短格式 (en, it)，转换为完整格式
            $locale_map = [
                'en' => 'en-GB',
                'it' => 'it-IT', 
                'fr' => 'fr-FR',
                'de' => 'de-DE',
                'es' => 'es-ES'
            ];
            $locale = $locale_map[$raw] ?? 'en-GB';
        }
    } else {
        $locale = 'en-GB'; // 默认英文
    }
    
    // 检查是否需要返回映射关系（Admin界面使用）
    $admin_mode = isset($_GET['admin']) && $_GET['admin'] === '1';

    $sql = 'SELECT
                c.id,
                c.category_name_en,
                COALESCE(ci.name, c.category_name_en) AS name,
                COALESCE(en_ci.name, c.category_name_en) AS name_en_gb
            FROM category c
            LEFT JOIN category_i18n ci ON c.id = ci.category_id AND ci.locale = ?
            LEFT JOIN category_i18n en_ci ON c.id = en_ci.category_id AND en_ci.locale = "en-GB"
            ORDER BY COALESCE(ci.name, c.category_name_en) ASC';

    $stmt = $conn->prepare($sql);
    if ($stmt === false) {
        json_response(500, ["message" => "查询准备失败: " . $conn->error]);
    }

    $stmt->bind_param('s', $locale);
    if (!$stmt->execute()) {
        json_response(500, ["message" => "查询执行失败: " . $stmt->error]);
    }
    
    // 添加调试日志（生产环境可关闭）
    error_log("Categories API - Requested locale: " . $locale . ", Raw input: " . ($raw ?? 'null'));

    $result = $stmt->get_result();
    $categories = [];
    $category_mapping = []; // 意大利语 -> 英语映射
    
    while ($row = $result->fetch_assoc()) {
        if ($admin_mode) {
            // Admin模式：返回完整的对象数组，包含映射关系
            $categories[] = [
                'id' => $row['id'],
                'name' => $row['name'], // Translated name
                'name_en_gb' => $row['name_en_gb'], // English name
                'english_name' => $row['category_name_en'] // English name for image key
            ];
        } else {
            // 普通模式：保持原有格式
            $categories[] = [
                'id' => $row['id'],
                'name' => $row['name'], // Translated name
                'english_name' => $row['category_name_en'] // English name for image key
            ];
        }
        // 建立映射关系
        $category_mapping[$row['name']] = $row['name_en_gb'];
    }
    $stmt->close();
    
    if ($admin_mode) {
        // Admin模式：返回完整数据和映射
        json_response(200, [
            'categories' => $categories,
            'mapping' => $category_mapping
        ]);
    } else {
        // 普通模式：保持原有格式
        json_response(200, $categories);
    }
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