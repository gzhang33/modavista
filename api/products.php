<?php
session_start();
// api/products.php（新版：三表结构）
require_once 'config.php';
require_once 'utils.php';

// CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// 非 GET 操作需要认证
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    require_auth();
}

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
if ($conn->connect_error) {
    json_response(500, ['message' => '数据库连接失败: ' . $conn->connect_error]);
}
$conn->set_charset('utf8mb4');

$method = $_SERVER['REQUEST_METHOD'];
switch ($method) {
    case 'GET':
        handle_get($conn);
        break;
    case 'POST':
        handle_post($conn);
        break;
    case 'DELETE':
        handle_delete($conn);
        break;
    default:
        json_response(405, ['message' => '不支持的方法']);
}

$conn->close();
function respond_error($http_status, $error_code, $message, $field = null) {
    $payload = ['error' => ['code' => (string)$error_code, 'message' => (string)$message]];
    if ($field !== null) { $payload['error']['field'] = (string)$field; }
    json_response($http_status, $payload);
}

// === GET ===
function handle_get($conn) {
    // language param for localized display fields - 支持所有欧洲语言
    $lang = isset($_GET['lang']) ? strtolower(trim($_GET['lang'])) : 'en';
    $valid_languages = ['en', 'it', 'fr', 'de', 'es', 'pt', 'nl', 'pl'];
    if (!in_array($lang, $valid_languages, true)) { $lang = 'en'; }

    // Helper to detect if a column exists; prevents SQL errors if migrations not applied
    $column_exists = function($table, $column) use ($conn) {
        $sql = 'SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ? LIMIT 1';
        $stmt = $conn->prepare($sql);
        if (!$stmt) return false;
        $db = DB_NAME;
        $stmt->bind_param('sss', $db, $table, $column);
        if (!$stmt->execute()) { $stmt->close(); return false; }
        $res = $stmt->get_result();
        $exists = (bool)$res->fetch_row();
        $stmt->close();
        return $exists;
    };
    
    // 检查所有语言字段是否存在
    $has_cat_lang = $column_exists('categories', "category_name_$lang");
    $has_col_lang = $column_exists('colors', "color_name_$lang");
    $has_mat_lang = $column_exists('materials', "material_name_$lang");
    $has_desc_lang = $column_exists('products', "description_$lang");
    
    // 根据实际数据库结构调整字段名
    $cat_field = $has_cat_lang ? "category_name_$lang" : "category_name_en";
    $col_field = $has_col_lang ? "color_name_$lang" : "color_name";
    $mat_field = $has_mat_lang ? "material_name_$lang" : "material_name";
    // 单个变体详情（保持前端兼容字段名；不再依赖已删除的 v.variant_name 字段）
    if (isset($_GET['id'])) {
        $variant_id = (int)$_GET['id'];
        $sql = 'SELECT 
                    v.id              AS variant_id,
                    v.default_image   AS default_image,
                    v.created_at      AS variant_created_at,
                    p.id              AS product_id,
                    p.base_name       AS base_name,
                    p.description     AS description,
                    p.category_id     AS category_id,
                    c.' . $cat_field . ' AS category_name,
                    clr.' . $col_field . ' AS color_name,
                    m.' . $mat_field . ' AS material_name
                FROM product_variants v
                JOIN products p ON v.product_id = p.id
                LEFT JOIN categories c ON p.category_id = c.id
                LEFT JOIN colors clr ON v.color_id = clr.id
                LEFT JOIN materials m ON v.material_id = m.id
                WHERE v.id = ?';
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            json_response(500, ['message' => '查询准备失败: ' . $conn->error]);
        }
        $stmt->bind_param('i', $variant_id);
        if (!$stmt->execute()) {
            json_response(500, ['message' => '查询执行失败: ' . $stmt->error]);
        }
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        $stmt->close();

        if (!$row) {
            json_response(404, ['message' => '产品未找到']);
        }

        // 媒体列表（排序）
        $media_stmt = $conn->prepare('SELECT image_path FROM product_media WHERE variant_id = ? ORDER BY sort_order ASC, id ASC');
        $media_stmt->bind_param('i', $variant_id);
        $media_stmt->execute();
        $media_result = $media_stmt->get_result();
        $media = [];
        while ($m = $media_result->fetch_assoc()) {
            $media[] = $m['image_path'];
        }
        $media_stmt->close();

        // 同组变体（siblings）- 使用 base_name 与 color_name 组合展示名
        $sib_sql = 'SELECT 
                        v.id AS id,
                        CONCAT(p.base_name, " - ", IFNULL(clr.color_name, "")) AS name,
                        v.default_image AS default_image,
                        v.created_at AS created_at
                    FROM product_variants v
                    JOIN products p ON v.product_id = p.id
                    LEFT JOIN colors clr ON v.color_id = clr.id
                    WHERE v.product_id = ?
                    ORDER BY v.created_at ASC, v.id ASC';
        $sib_stmt = $conn->prepare($sib_sql);
        $sib_stmt->bind_param('i', $row['product_id']);
        $sib_stmt->execute();
        $sib_res = $sib_stmt->get_result();
        $siblings = [];
        while ($s = $sib_res->fetch_assoc()) {
            $siblings[] = [
                'id' => (int)$s['id'],
                'name' => $s['name'],
                'defaultImage' => $s['default_image'],
                'createdAt' => $s['created_at'],
            ];
        }
        $sib_stmt->close();

        $display_name = $row['base_name'] . ' - ' . ($row['color_name'] ?? '');
        $response = [
            'id' => (int)$row['variant_id'],
            'product_id' => (int)$row['product_id'],
            // 兼容旧前端字段：提供组合名称
            'name' => trim($display_name),
            'base_name' => $row['base_name'],
            'description' => $row['description'],
            'category' => $row['category_name'],
            'category_id' => $row['category_id'] ? (int)$row['category_id'] : null,
            'color' => $row['color_name'],
            'material' => $row['material_name'],
            'defaultImage' => $row['default_image'],
            'media' => $media,
            'createdAt' => $row['variant_created_at'],
            'siblings' => $siblings,
        ];
        json_response(200, $response);
        return;
    }

    // 根据产品 ID 获取该产品的所有变体（用于后台编辑同组展示）
    if (isset($_GET['product_id'])) {
        $product_id = (int)$_GET['product_id'];
        $sql = 'SELECT 
                    v.id AS id,
                    CONCAT(p.base_name, " - ", IFNULL(clr.color_name, "")) AS name,
                    v.default_image AS defaultImage,
                    v.created_at AS created_at
                FROM product_variants v
                JOIN products p ON v.product_id = p.id
                LEFT JOIN colors clr ON v.color_id = clr.id
                WHERE v.product_id = ?
                ORDER BY v.created_at ASC, v.id ASC';
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            json_response(500, ['message' => '查询准备失败: ' . $conn->error]);
        }
        $stmt->bind_param('i', $product_id);
        $stmt->execute();
        $res = $stmt->get_result();
        $rows = [];
        while ($r = $res->fetch_assoc()) {
            $rows[] = [
                'id' => (int)$r['id'],
                'name' => $r['name'],
                'defaultImage' => $r['defaultImage'],
                'createdAt' => $r['created_at'],
            ];
        }
        $stmt->close();
        json_response(200, $rows);
        return;
    }

    // 列表（按变体返回，保持与旧前端兼容）
    $where = [];
    $params = [];
    $types = '';

    // 归档功能已移除：忽略 archived 参数，避免引用已删除的列

    // 模糊搜索（基名或颜色名）
    if (!empty($_GET['search'])) {
        $where[] = '(p.base_name LIKE ? OR clr.color_name LIKE ?)';
        $params[] = '%' . $_GET['search'] . '%';
        $params[] = '%' . $_GET['search'] . '%';
        $types .= 'ss';
    }

    // 分类（按名称，以保持前端兼容）
    if (!empty($_GET['category'])) {
        $where[] = "c.$cat_field = ?";
        $params[] = $_GET['category'];
        $types .= 's';
    }

    $sql = 'SELECT 
                v.id            AS id,
                CONCAT_WS(" - ", p.base_name, clr.' . $col_field . ') AS name,
                v.default_image AS default_image,
                v.created_at    AS created_at,
                p.base_name     AS base_name,
                p.description   AS description,
                p.id            AS product_id,
                c.' . $cat_field . ' AS category,
                clr.' . $col_field . ' AS color,
                m.' . $mat_field . ' AS material
            FROM product_variants v
            JOIN products p ON v.product_id = p.id
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN colors clr ON v.color_id = clr.id
            LEFT JOIN materials m ON v.material_id = m.id';
    if ($where) {
        $sql .= ' WHERE ' . implode(' AND ', $where);
    }
    $sql .= ' ORDER BY v.created_at DESC';

    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        json_response(500, ['message' => '查询准备失败: ' . $conn->error]);
    }
    if ($params) {
        $stmt->bind_param($types, ...$params);
    }
    $stmt->execute();
    $res = $stmt->get_result();
    $rows = [];
    while ($r = $res->fetch_assoc()) {
        $rows[] = [
            'id' => (int)$r['id'],
            'name' => $r['name'],
            'base_name' => $r['base_name'],
            'description' => $r['description'],
            'category' => $r['category'],
            'product_id' => (int)$r['product_id'],
            'color' => $r['color'],
            'material' => $r['material'],
            'defaultImage' => $r['default_image'],
            'media' => [],
            'createdAt' => $r['created_at'],
        ];
    }
    $stmt->close();
    json_response(200, $rows);
}

// === POST === 创建或更新
function handle_post($conn) {
    $variant_id = $_POST['id'] ?? null; // 若提供则视为更新

    if ($variant_id) {
        // 更新：允许更新默认图；同时可更新产品基础信息与分类（不再维护已弃用的变体名称字段）
        $variant_id = (int)$variant_id;
        $base_name = $_POST['base_name'] ?? ($_POST['name'] ?? null);
        $description = $_POST['description'] ?? null;
        $category_id = isset($_POST['category_id']) ? (int)$_POST['category_id'] : null;
        $category_name = $_POST['category_name'] ?? ($_POST['category'] ?? null);

        if (($category_id === null || $category_id === 0) && $category_name) {
            $category_id = resolve_category_id($conn, $category_name);
        }

        // 上传媒体（可选）
        $upload = upload_media_for_field('media');
        $uploaded = $upload['media'];
        $default_image = $upload['default'];
        // 允许通过现有路径设置默认图（无需上传）
        $requested_default_path = isset($_POST['default_image_path']) ? trim((string)$_POST['default_image_path']) : null;
        if ($requested_default_path !== null && $requested_default_path !== '') {
            $default_image = $requested_default_path;
        }

        // 开启事务
        $conn->begin_transaction();

        // 更新 products（可选字段）
        if ($base_name !== null || $description !== null || $category_id !== null) {
            $sql = 'UPDATE products p
                    JOIN product_variants v ON v.product_id = p.id
                    SET p.base_name = COALESCE(?, p.base_name),
                        p.description = COALESCE(?, p.description),
                        p.category_id = COALESCE(?, p.category_id)
                    WHERE v.id = ?';
            $stmt = $conn->prepare($sql);
            if (!$stmt) {
                $conn->rollback();
                json_response(500, ['message' => '更新准备失败: ' . $conn->error]);
            }
            $nullable_category = $category_id; // may be null
            $stmt->bind_param('ssii', $base_name, $description, $nullable_category, $variant_id);
            if (!$stmt->execute()) {
                $stmt->close();
                $conn->rollback();
                json_response(500, ['message' => '更新产品失败: ' . $conn->error]);
            }
            $stmt->close();
        }

        // 更新变体默认图（可选）
        if ($default_image !== null) {
            $sql = 'UPDATE product_variants SET 
                        default_image = COALESCE(?, default_image)
                    WHERE id = ?';
            $stmt = $conn->prepare($sql);
            if (!$stmt) {
                $conn->rollback();
                json_response(500, ['message' => '更新准备失败: ' . $conn->error]);
            }
            $stmt->bind_param('si', $default_image, $variant_id);
            if (!$stmt->execute()) {
                $stmt->close();
                $conn->rollback();
                json_response(500, ['message' => '更新变体失败: ' . $conn->error]);
            }
            $stmt->close();
        }

        // 处理删除的媒体（可选）
        $delete_media = [];
        if (isset($_POST['delete_media'])) {
            if (is_array($_POST['delete_media'])) {
                $delete_media = array_values(array_filter(array_map('strval', $_POST['delete_media'])));
            } elseif (is_string($_POST['delete_media'])) {
                $decoded = json_decode($_POST['delete_media'], true);
                if (is_array($decoded)) { $delete_media = array_values(array_filter(array_map('strval', $decoded))); }
            }
        }
        if (!empty($delete_media)) {
            $ph = implode(',', array_fill(0, count($delete_media), '?'));
            $types = str_repeat('s', count($delete_media));
            $sql = "DELETE FROM product_media WHERE variant_id = ? AND image_path IN ($ph)";
            $stmt = $conn->prepare($sql);
            if (!$stmt) { $conn->rollback(); json_response(500, ['message' => '删除媒体准备失败: ' . $conn->error]); }
            // 动态绑定参数（按引用）
            $bind_types = 'i' . $types;
            $params = array_merge([$bind_types, $variant_id], $delete_media);
            $refs = [];
            foreach ($params as $k => $v) { $refs[$k] = &$params[$k]; }
            if (!call_user_func_array([$stmt, 'bind_param'], $refs)) { $stmt->close(); $conn->rollback(); json_response(500, ['message' => '删除媒体绑定失败: ' . $conn->error]); }
            if (!$stmt->execute()) { $stmt->close(); $conn->rollback(); json_response(500, ['message' => '删除媒体失败: ' . $conn->error]); }
            $stmt->close();
        }

        // 更新媒体排序（可选）：按传入顺序写入 sort_order
        $media_order = [];
        if (isset($_POST['media_order'])) {
            if (is_array($_POST['media_order'])) {
                $media_order = array_values(array_filter(array_map('strval', $_POST['media_order'])));
            } elseif (is_string($_POST['media_order'])) {
                $decoded = json_decode($_POST['media_order'], true);
                if (is_array($decoded)) { $media_order = array_values(array_filter(array_map('strval', $decoded))); }
            }
        }
        if (!empty($media_order)) {
            $upd = $conn->prepare('UPDATE product_media SET sort_order = ? WHERE variant_id = ? AND image_path = ?');
            if (!$upd) { $conn->rollback(); json_response(500, ['message' => '媒体排序更新准备失败: ' . $conn->error]); }
            foreach ($media_order as $index => $path) {
                $i = (int)$index;
                $p = (string)$path;
                $upd->bind_param('iis', $i, $variant_id, $p);
                if (!$upd->execute()) { $upd->close(); $conn->rollback(); json_response(500, ['message' => '媒体排序更新失败: ' . $conn->error]); }
            }
            $upd->close();
        }

        // 新增媒体明细（按顺序）
        if (!empty($uploaded)) {
            $insert = $conn->prepare('INSERT INTO product_media (variant_id, image_path, sort_order) VALUES (?, ?, ?)');
            if (!$insert) {
                $conn->rollback();
                json_response(500, ['message' => '媒体插入准备失败: ' . $conn->error]);
            }
            foreach ($uploaded as $index => $path) {
                $sort = (int)$index;
                $insert->bind_param('isi', $variant_id, $path, $sort);
                if (!$insert->execute()) {
                    $insert->close();
                    $conn->rollback();
                    json_response(500, ['message' => '媒体插入失败: ' . $conn->error]);
                }
            }
            $insert->close();
        }

        // ====== 若在编辑模式下附带新增同组颜色（variants_meta），则为同一产品创建新变体 ======
        $variants_meta_json = $_POST['variants_meta'] ?? null; // JSON: [{index:0,color:"Red"}, ...]
        if ($variants_meta_json) {
            // 查出当前变体所属的 product_id
            $pid_stmt = $conn->prepare('SELECT product_id FROM product_variants WHERE id = ?');
            if (!$pid_stmt) { $conn->rollback(); json_response(500, ['message' => '查询产品失败: ' . $conn->error]); }
            $pid_stmt->bind_param('i', $variant_id);
            if (!$pid_stmt->execute()) { $pid_stmt->close(); $conn->rollback(); json_response(500, ['message' => '查询产品失败: ' . $conn->error]); }
            $pid_res = $pid_stmt->get_result();
            $pid_row = $pid_res->fetch_assoc();
            $pid_stmt->close();
            if (!$pid_row || empty($pid_row['product_id'])) { $conn->rollback(); json_response(404, ['message' => '产品不存在']); }
            $product_id_for_new = (int)$pid_row['product_id'];

            // 解析材质（沿用提交的 material 名称）
            $material_name_for_new = $_POST['material'] ?? null;
            $material_id_for_new = null;
            if ($material_name_for_new) {
                $material_id_for_new = resolve_material_id($conn, $material_name_for_new);
            }

            $decoded_meta = json_decode($variants_meta_json, true);
            if (is_array($decoded_meta) && !empty($decoded_meta)) {
                foreach ($decoded_meta as $variant_meta) {
                    $idx = isset($variant_meta['index']) ? (int)$variant_meta['index'] : null;
                    $key = isset($variant_meta['key']) ? trim((string)$variant_meta['key']) : null;
                    $color = isset($variant_meta['color']) ? trim($variant_meta['color']) : '';
                    if ($color === '') {
                        $conn->rollback();
                        respond_error(400, 'VARIANT_COLOR_EMPTY', '颜色名称不能为空', $key !== null ? "variants_meta[$key].color" : "variants_meta[$idx].color");
                    }

                    $variant_color_id = resolve_color_id($conn, $color);
                    $field = $key !== null && $key !== '' ? ('variant_media_' . $key) : ('variant_media_' . $idx);
                    $upload = upload_media_for_field($field);
                    $default_image_new = $upload['default'];

                    $v_ins = $conn->prepare('INSERT INTO product_variants (product_id, color_id, material_id, default_image) VALUES (?, ?, ?, ?)');
                    if (!$v_ins) { $conn->rollback(); respond_error(500, 'DB_PREPARE_FAILED', '创建变体失败: ' . $conn->error); }
                    $v_ins->bind_param('iiis', $product_id_for_new, $variant_color_id, $material_id_for_new, $default_image_new);
                    if (!$v_ins->execute()) { $v_ins->close(); $conn->rollback(); respond_error(500, 'DB_EXECUTE_FAILED', '创建变体失败: ' . $conn->error); }
                    $new_variant_id = $v_ins->insert_id;
                    $v_ins->close();

                    if (!empty($upload['media'])) {
                        $m_ins = $conn->prepare('INSERT INTO product_media (variant_id, image_path, sort_order) VALUES (?, ?, ?)');
                        if (!$m_ins) { $conn->rollback(); respond_error(500, 'DB_PREPARE_FAILED', '创建媒体失败: ' . $conn->error); }
                        foreach ($upload['media'] as $index => $path) {
                            $sort = (int)$index;
                            $m_ins->bind_param('isi', $new_variant_id, $path, $sort);
                            if (!$m_ins->execute()) { $m_ins->close(); $conn->rollback(); respond_error(500, 'DB_EXECUTE_FAILED', '创建媒体失败: ' . $conn->error, $field); }
                        }
                        $m_ins->close();
                    }
                }
            }
        }

        // 提交事务
        if (!$conn->commit()) {
            $conn->rollback();
            json_response(500, ['message' => '提交事务失败: ' . $conn->error]);
        }

        // 清理已无引用的本地图片文件（事务外）
        $files_removed = cleanup_orphan_images($conn);
        json_response(200, ['message' => '产品更新成功', 'id' => $variant_id, 'files_removed' => $files_removed]);
        return;
    }

    // 创建：支持批量变体
    $base_name = $_POST['base_name'] ?? ($_POST['name'] ?? null);
    $description = $_POST['description'] ?? null;
    $category_id = isset($_POST['category_id']) ? (int)$_POST['category_id'] : null;
    $category_name = $_POST['category_name'] ?? ($_POST['category'] ?? null);
    $material_name = $_POST['material'] ?? null;
    $variants_meta_json = $_POST['variants_meta'] ?? null; // JSON: [{index:0,color:"Red"}, ...]
    // 新增：支持简单的 variants 数组（例如 variants[] 或 JSON 字符串）
    $variants_array = [];
    if (isset($_POST['variants'])) {
        if (is_array($_POST['variants'])) {
            $variants_array = $_POST['variants'];
        } elseif (is_string($_POST['variants'])) {
            $decoded_variants = json_decode($_POST['variants'], true);
            if (is_array($decoded_variants)) { $variants_array = $decoded_variants; }
        }
        // 过滤空白项
        $variants_array = array_values(array_filter(array_map(function ($v) {
            return trim((string)$v);
        }, $variants_array), function ($v) { return $v !== ''; }));
    }

    if (!$base_name) {
        json_response(400, ['message' => 'base_name 不能为空']);
    }
    if (!$category_id && $category_name) {
        $category_id = resolve_category_id($conn, $category_name);
    }
    if (!$category_id) {
        json_response(400, ['message' => '缺少 category_id 或 category_name']);
    }
    
    // 解析材质ID
    $material_id = null;
    if ($material_name) {
        $material_id = resolve_material_id($conn, $material_name);
    }

    // 解析颜色ID（来自颜色名称）
    $color_name = $_POST['color'] ?? ($_POST['variant_name'] ?? '');
    $color_id = null;
    if ($color_name) {
        $color_id = resolve_color_id($conn, $color_name);
    }

    // 开启事务
    $conn->begin_transaction();

    // 新建产品
    $p_stmt = $conn->prepare('INSERT INTO products (base_name, description, category_id) VALUES (?, ?, ?)');
    if (!$p_stmt) {
        $conn->rollback();
        json_response(500, ['message' => '创建产品失败: ' . $conn->error]);
    }
    $p_stmt->bind_param('ssi', $base_name, $description, $category_id);
    if (!$p_stmt->execute()) {
        $p_stmt->close();
        $conn->rollback();
        json_response(500, ['message' => '创建产品失败: ' . $conn->error]);
    }
    $product_id = $p_stmt->insert_id;
    $p_stmt->close();

    $created_variant_ids = [];

    $variants_meta = [];
    if ($variants_meta_json) {
        $decoded = json_decode($variants_meta_json, true);
        if (is_array($decoded)) {
            $variants_meta = $decoded;
        }
    }

    // —— 始终先创建主变体（使用主表单的 media[] 与 color） ——
    $upload_main = upload_media_for_field('media');
    $default_image_main = $upload_main['default'];
    $color_main = $_POST['color'] ?? ($_POST['variant_name'] ?? '');
    if (empty($color_main)) {
        $conn->rollback();
        json_response(400, ['message' => '颜色名称不能为空']);
    }
    $color_id_main = resolve_color_id($conn, $color_main);
    $v_main = $conn->prepare('INSERT INTO product_variants (product_id, color_id, material_id, default_image) VALUES (?, ?, ?, ?)');
    if (!$v_main) { $conn->rollback(); json_response(500, ['message' => '创建变体失败: ' . $conn->error]); }
    $v_main->bind_param('iiis', $product_id, $color_id_main, $material_id, $default_image_main);
    if (!$v_main->execute()) { $v_main->close(); $conn->rollback(); json_response(500, ['message' => '创建变体失败: ' . $conn->error]); }
    $main_variant_id = $v_main->insert_id;
    $v_main->close();
    if (!empty($upload_main['media'])) {
        $m_main = $conn->prepare('INSERT INTO product_media (variant_id, image_path, sort_order) VALUES (?, ?, ?)');
        if (!$m_main) { $conn->rollback(); json_response(500, ['message' => '创建媒体失败: ' . $conn->error]); }
        foreach ($upload_main['media'] as $index => $path) {
            $sort = (int)$index;
            $m_main->bind_param('isi', $main_variant_id, $path, $sort);
            if (!$m_main->execute()) { $m_main->close(); $conn->rollback(); json_response(500, ['message' => '创建媒体失败: ' . $conn->error]); }
        }
        $m_main->close();
    }
    $created_variant_ids[] = $main_variant_id;

    // —— 再创建同组颜色（如有） ——
    if (!empty($variants_meta)) {
        // 批量变体创建：支持 key 和 index 两种字段命名
        foreach ($variants_meta as $variant_meta) {
            $idx = isset($variant_meta['index']) ? (int)$variant_meta['index'] : null;
            $key = isset($variant_meta['key']) ? trim((string)$variant_meta['key']) : null;
            $color = isset($variant_meta['color']) ? trim($variant_meta['color']) : '';
            if ($color === '') {
                $conn->rollback();
                respond_error(400, 'VARIANT_COLOR_EMPTY', '颜色名称不能为空', $key !== null ? "variants_meta[$key].color" : "variants_meta[$idx].color");
            }

            // 针对该变体解析颜色 ID（独立于主颜色）
            $variant_color_id = resolve_color_id($conn, $color);

            // 根据 key 或 index 解析上传字段名
            $field = $key !== null && $key !== '' ? ('variant_media_' . $key) : ('variant_media_' . $idx);
            $upload = upload_media_for_field($field);
            $default_image = $upload['default'];

            // 读取客户端给的排序与默认：名称映射到保存路径
            $provided_order = [];
            $provided_default_name = null;
            $order_field = $key !== null && $key !== '' ? ('variant_media_order_' . $key) : ('variant_media_order_' . $idx);
            $default_field = $key !== null && $key !== '' ? ('variant_default_media_' . $key) : ('variant_default_media_' . $idx);
            if (isset($_POST[$order_field])) {
                if (is_string($_POST[$order_field])) {
                    $decoded_order = json_decode($_POST[$order_field], true);
                    if (is_array($decoded_order)) { $provided_order = $decoded_order; }
                } elseif (is_array($_POST[$order_field])) {
                    $provided_order = $_POST[$order_field];
                }
                // 仅保留字符串名称
                $provided_order = array_values(array_filter(array_map('strval', $provided_order), function($v){ return $v !== ''; }));
            }
            if (isset($_POST[$default_field])) {
                $provided_default_name = trim((string)$_POST[$default_field]);
            }

            $v_stmt = $conn->prepare('INSERT INTO product_variants (product_id, color_id, material_id, default_image) VALUES (?, ?, ?, ?)');
            if (!$v_stmt) { $conn->rollback(); respond_error(500, 'DB_PREPARE_FAILED', '创建变体失败: ' . $conn->error); }
            $v_stmt->bind_param('iiis', $product_id, $variant_color_id, $material_id, $default_image);
            if (!$v_stmt->execute()) { $v_stmt->close(); $conn->rollback(); respond_error(500, 'DB_EXECUTE_FAILED', '创建变体失败: ' . $conn->error); }
            $variant_id = $v_stmt->insert_id;
            $v_stmt->close();

            if (!empty($upload['media'])) {
                // 如果前端提供顺序名称，则按名称映射保存路径并覆盖顺序
                $ordered_paths = $upload['media'];
                if (!empty($provided_order) && isset($upload['media_map']) && is_array($upload['media_map'])) {
                    $ordered_paths = [];
                    foreach ($provided_order as $name) {
                        if (isset($upload['media_map'][$name])) {
                            $ordered_paths[] = $upload['media_map'][$name];
                        }
                    }
                    // 加入遗漏的
                    foreach ($upload['media'] as $p) {
                        if (!in_array($p, $ordered_paths, true)) { $ordered_paths[] = $p; }
                    }
                }

                // 如果提供了默认名称，则覆盖默认图
                if ($provided_default_name && isset($upload['media_map'][$provided_default_name])) {
                    $default_image = $upload['media_map'][$provided_default_name];
                    // 更新变体默认图
                    $upd_def = $conn->prepare('UPDATE product_variants SET default_image = ? WHERE id = ?');
                    if (!$upd_def) { $conn->rollback(); respond_error(500, 'DB_PREPARE_FAILED', '更新默认图失败: ' . $conn->error, $default_field); }
                    $upd_def->bind_param('si', $default_image, $variant_id);
                    if (!$upd_def->execute()) { $upd_def->close(); $conn->rollback(); respond_error(500, 'DB_EXECUTE_FAILED', '更新默认图失败: ' . $conn->error, $default_field); }
                    $upd_def->close();
                }

                $m_stmt = $conn->prepare('INSERT INTO product_media (variant_id, image_path, sort_order) VALUES (?, ?, ?)');
                if (!$m_stmt) { $conn->rollback(); respond_error(500, 'DB_PREPARE_FAILED', '创建媒体失败: ' . $conn->error); }
                foreach ($ordered_paths as $index => $path) {
                    $sort = (int)$index;
                    $m_stmt->bind_param('isi', $variant_id, $path, $sort);
                    if (!$m_stmt->execute()) { $m_stmt->close(); $conn->rollback(); respond_error(500, 'DB_EXECUTE_FAILED', '创建媒体失败: ' . $conn->error, $field); }
                }
                $m_stmt->close();
            }

            $created_variant_ids[] = $variant_id;
        }
    } elseif (!empty($variants_array)) {
        // 简单变体数组（仅颜色，无独立媒体上传）
        $v_stmt = $conn->prepare('INSERT INTO product_variants (product_id, color_id, material_id, default_image) VALUES (?, ?, ?, NULL)');
        if (!$v_stmt) { $conn->rollback(); json_response(500, ['message' => '创建变体失败: ' . $conn->error]); }
        foreach ($variants_array as $color_name) {
            $color = trim((string)$color_name);
            if (empty($color)) {
                $v_stmt->close();
                $conn->rollback();
                json_response(400, ['message' => '颜色名称不能为空']);
            }
            $color_id = resolve_color_id($conn, $color);
            $v_stmt->bind_param('iii', $product_id, $color_id, $material_id);
            if (!$v_stmt->execute()) { $v_stmt->close(); $conn->rollback(); json_response(500, ['message' => '创建变体失败: ' . $conn->error]); }
            $created_variant_ids[] = $v_stmt->insert_id;
        }
        $v_stmt->close();
    }

    // 提交事务
    if (!$conn->commit()) {
        $conn->rollback();
        json_response(500, ['message' => '提交事务失败: ' . $conn->error]);
    }

    // 创建后做一次轻量清理（防止早期遗留文件）
    $files_removed = cleanup_orphan_images($conn);
    json_response(201, ['message' => '产品创建成功', 'product_id' => $product_id, 'variant_ids' => $created_variant_ids, 'files_removed' => $files_removed]);
}

// === DELETE === 删除变体（批量/单个）并清理孤儿产品
function handle_delete($conn) {
    $data = json_decode(file_get_contents('php://input'), true);

    $ids = [];
    if (isset($data['ids']) && is_array($data['ids'])) {
        $ids = array_map('intval', $data['ids']);
    } elseif (isset($_GET['id'])) {
        $ids = [(int)$_GET['id']];
    }

    if (empty($ids)) {
        json_response(400, ['message' => '缺少要删除的变体 ID']);
    }

    // 删除媒体
    $placeholders = implode(',', array_fill(0, count($ids), '?'));
    $types = str_repeat('i', count($ids));

    $m_del = $conn->prepare("DELETE FROM product_media WHERE variant_id IN ($placeholders)");
    $m_del->bind_param($types, ...$ids);
    $m_del->execute();
    $m_del->close();

    // 找到相关产品 id 用于后续清理
    $get_p = $conn->prepare("SELECT DISTINCT product_id FROM product_variants WHERE id IN ($placeholders)");
    $get_p->bind_param($types, ...$ids);
    $get_p->execute();
    $res = $get_p->get_result();
    $product_ids = [];
    while ($r = $res->fetch_assoc()) {
        $product_ids[] = (int)$r['product_id'];
    }
    $get_p->close();

    // 删除变体
    $v_del = $conn->prepare("DELETE FROM product_variants WHERE id IN ($placeholders)");
    $v_del->bind_param($types, ...$ids);
    $v_del->execute();
    $affected = $v_del->affected_rows;
    $v_del->close();

    // 清理无变体的产品
    if (!empty($product_ids)) {
        $p_ph = implode(',', array_fill(0, count($product_ids), '?'));
        $p_types = str_repeat('i', count($product_ids));
        $cleanup = $conn->prepare("DELETE p FROM products p LEFT JOIN product_variants v ON v.product_id = p.id WHERE v.id IS NULL AND p.id IN ($p_ph)");
        $cleanup->bind_param($p_types, ...$product_ids);
        $cleanup->execute();
        $cleanup->close();
    }

    // 删除后清理未被数据库引用的本地图片
    $files_removed = cleanup_orphan_images($conn);
    json_response(200, ['message' => '删除成功', 'deleted_count' => $affected, 'files_removed' => $files_removed]);
}

// === PUT === 归档/恢复（针对变体）
// 归档功能已移除

// === helpers ===
function resolve_category_id($conn, $category_name) {
    $category_name = trim((string)$category_name);
    if ($category_name === '') { return null; }
    $sel = $conn->prepare('SELECT id FROM categories WHERE category_name = ?');
    $sel->bind_param('s', $category_name);
    $sel->execute();
    $res = $sel->get_result();
    $row = $res->fetch_assoc();
    $sel->close();
    if ($row) { return (int)$row['id']; }

    // 若不存在则创建
    $ins = $conn->prepare('INSERT INTO categories (category_name) VALUES (?)');
    $ins->bind_param('s', $category_name);
    $ins->execute();
    $id = $ins->insert_id;
    $ins->close();
    return (int)$id;
}

function resolve_material_id($conn, $material_name) {
    $material_name = trim((string)$material_name);
    if ($material_name === '') { return null; }
    $sel = $conn->prepare('SELECT id FROM materials WHERE material_name = ?');
    $sel->bind_param('s', $material_name);
    $sel->execute();
    $res = $sel->get_result();
    $row = $res->fetch_assoc();
    $sel->close();
    if ($row) { return (int)$row['id']; }

    // 若不存在则创建
    $ins = $conn->prepare('INSERT INTO materials (material_name) VALUES (?)');
    $ins->bind_param('s', $material_name);
    $ins->execute();
    $id = $ins->insert_id;
    $ins->close();
    return (int)$id;
}

function resolve_color_id($conn, $color_name) {
    $color_name = trim((string)$color_name);
    if ($color_name === '') { return null; }
    $sel = $conn->prepare('SELECT id FROM colors WHERE color_name = ?');
    $sel->bind_param('s', $color_name);
    $sel->execute();
    $res = $sel->get_result();
    $row = $res->fetch_assoc();
    $sel->close();
    if ($row) { return (int)$row['id']; }

    // 若不存在则创建
    $ins = $conn->prepare('INSERT INTO colors (color_name) VALUES (?)');
    $ins->bind_param('s', $color_name);
    $ins->execute();
    $id = $ins->insert_id;
    $ins->close();
    return (int)$id;
}

function upload_media_for_field($field) {
    $uploaded = [];
    $name_to_path = [];
    if (isset($_FILES[$field]) && !empty($_FILES[$field]['name'][0])) {
        $files = $_FILES[$field];
        $count = count($files['name']);
        $dir = UPLOAD_DIR;
        if (!is_dir($dir)) { mkdir($dir, 0755, true); }
        $max_size = 5 * 1024 * 1024; // 5MB
        $finfo = function_exists('finfo_open') ? finfo_open(FILEINFO_MIME_TYPE) : null;
        for ($i = 0; $i < $count; $i++) {
            if ($files['error'][$i] !== UPLOAD_ERR_OK) { continue; }
            $tmp = $files['tmp_name'][$i];
            $orig = basename($files['name'][$i]);
            $ext = strtolower(pathinfo($orig, PATHINFO_EXTENSION));
            $allowed = defined('UPLOAD_ALLOWED_EXTS') ? UPLOAD_ALLOWED_EXTS : ['jpg','jpeg','png','gif','webp'];
            if (!in_array($ext, $allowed, true)) { continue; }
            if (!is_uploaded_file($tmp)) { continue; }
            if (filesize($tmp) > $max_size) { continue; }
            if ($finfo) {
                $mime = finfo_file($finfo, $tmp);
                if (!preg_match('/^image\/(jpeg|png|gif|webp)$/i', (string)$mime)) { continue; }
            }
            $unique = 'media-' . uniqid() . '-' . bin2hex(random_bytes(4)) . '.' . $ext;
            $target = $dir . $unique;
            if (move_uploaded_file($tmp, $target)) {
                $db_path = 'images/' . $unique;
                $uploaded[] = $db_path;
                $name_to_path[$orig] = $db_path; // 用原始文件名做映射
            }
        }
        if ($finfo) { finfo_close($finfo); }
    }
    return [
        'media' => $uploaded,
        'default' => $uploaded[0] ?? null,
        'media_map' => $name_to_path,
    ];
}

/**
 * 清理 images/ 目录下数据库未引用的图片文件
 * - 仅删除扩展名为 jpg|jpeg|png|gif|webp 的文件
 * - 跳过占位图 placeholder.svg / placeholder-optimized.svg
 * 返回删除的文件数量
 */
function cleanup_orphan_images($conn, $dir = UPLOAD_DIR) {
    $deleted = 0;
    $base_dir = realpath($dir);
    if ($base_dir === false) { return 0; }

    // 构建数据库引用集合
    $referenced = [];
    $stmt1 = $conn->prepare('SELECT default_image FROM product_variants WHERE default_image IS NOT NULL AND default_image <> ""');
    if ($stmt1 && $stmt1->execute()) {
        $res1 = $stmt1->get_result();
        while ($r = $res1->fetch_assoc()) {
            $referenced[$r['default_image']] = true;
        }
        $stmt1->close();
    }

    $stmt2 = $conn->prepare('SELECT image_path FROM product_media');
    if ($stmt2 && $stmt2->execute()) {
        $res2 = $stmt2->get_result();
        while ($r = $res2->fetch_assoc()) {
            $referenced[$r['image_path']] = true;
        }
        $stmt2->close();
    }

    // 遍历物理目录
    $patterns = ['*.jpg','*.jpeg','*.png','*.gif','*.webp'];
    $files = [];
    foreach ($patterns as $p) {
        $files = array_merge($files, glob($dir . $p));
    }

    foreach ($files as $file_path) {
        $real = realpath($file_path);
        if ($real === false) { continue; }
        if (strpos($real, $base_dir) !== 0) { continue; }

        $basename = basename($real);
        // 规范化为数据库路径格式
        $db_path = 'images/' . $basename;

        // 跳过占位文件（仅作为安全网
        if ($basename === 'placeholder.svg' || $basename === 'placeholder-optimized.svg') { continue; }

        if (!isset($referenced[$db_path])) {
            @unlink($real);
            if (!file_exists($real)) { $deleted++; }
        }
    }

    return $deleted;
}
?>
