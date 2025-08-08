<?php
session_start();
// api/products.php
require_once 'config.php';
require_once 'utils.php';

// 允许跨域请求
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// 处理 OPTIONS 预检请求
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// 只对写操作需要认证，读操作允许公开访问
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    require_auth();
}


// --- 数据库连接设置 ---
$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

// 检查连接是否成功
if ($conn->connect_error) {
    json_response(500, ["message" => "数据库连接失败: " . $conn->connect_error]);
}

$conn->set_charset("utf8mb4");

// --- API 逻辑 ---
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        handle_get($conn);
        break;
    case 'POST':
        handle_post($conn);
        break;
    case 'PUT':
        handle_put($conn);
        break;
    case 'DELETE':
        handle_delete($conn);
        break;
    default:
        json_response(405, ["message" => "不支持的方法"]);
        break;
}

$conn->close();

/**
 * 处理 GET 请求
 */
function handle_get($conn) {
    if (isset($_GET['id'])) {
        // --- Get single product ---
        $id = $_GET['id'];
        $stmt = $conn->prepare("SELECT * FROM products WHERE id = ?");
        $stmt->bind_param("s", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($product = $result->fetch_assoc()) {
            $product['media'] = json_decode($product['media'], true) ?: [];
            json_response(200, $product);
        } else {
            json_response(404, ["message" => "产品未找到"]);
        }
        $stmt->close();
        return;
    }

    // --- Advanced Filtering Logic ---
    $sql = "SELECT * FROM products";
    $where_clauses = [];
    $params = [];
    $types = "";
    
    // Handle the 'archived' status filter
    $archived_status = isset($_GET['archived']) ? (int)$_GET['archived'] : 0;
    $where_clauses[] = "archived = ?";
    $params[] = $archived_status;
    $types .= "i";
    
    // --- Simple Search Fallback ---
    if (isset($_GET['search'])) {
        $where_clauses[] = "name LIKE ?";
        $params[] = "%" . $_GET['search'] . "%";
        $types .= "s";
    }
    if (isset($_GET['category'])) {
        $where_clauses[] = "category = ?";
        $params[] = $_GET['category'];
        $types .= "s";
    }
    if (!empty($where_clauses)) {
        $sql .= " WHERE " . implode(" AND ", $where_clauses);
    }

    $sql .= " ORDER BY createdAt DESC";

    $stmt = $conn->prepare($sql);

    if ($stmt === false) {
        json_response(500, ["message" => "查询准备失败: " . $conn->error]);
        return;
    }

    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }

    $stmt->execute();
    $result = $stmt->get_result();

    $products = [];
    while ($row = $result->fetch_assoc()) {
        $row['media'] = json_decode($row['media'], true) ?: [];
        $products[] = $row;
    }

    json_response(200, $products);
    $stmt->close();
}

/**
 * 处理 POST (创建/更新) 请求
 */
function handle_post($conn) {
    // 文本数据从 $_POST 获取
    $id = $_POST['id'] ?? null;
    $name = $_POST['name'] ?? null;
    $description = $_POST['description'] ?? null;
    $category = $_POST['category'] ?? null;

    if (empty($name) || empty($category)) {
        json_response(400, ['message' => '产品名称和分类是必填项']);
    }

    // --- 文件上传逻辑 ---
    $uploaded_media_paths = [];
    if (isset($_FILES['media']) && !empty($_FILES['media']['name'][0])) {
        $files = $_FILES['media'];
        $file_count = count($files['name']);
        $target_dir = UPLOAD_DIR;

        if (!is_dir($target_dir)) {
            mkdir($target_dir, 0755, true);
        }

        for ($i = 0; $i < $file_count; $i++) {
            if ($files['error'][$i] === UPLOAD_ERR_OK) {
                $file_tmp_name = $files['tmp_name'][$i];
                $file_name = basename($files['name'][$i]);
                $imageFileType = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));
                
                // 验证 (可添加更多)
                $allowed_formats = ["jpg", "jpeg", "png", "gif", "webp"];
                if (!in_array($imageFileType, $allowed_formats)) continue;

                $unique_name = "media-" . uniqid() . "-" . bin2hex(random_bytes(4)) . "." . $imageFileType;
                $target_file = $target_dir . $unique_name;

                if (move_uploaded_file($file_tmp_name, $target_file)) {
                    $uploaded_media_paths[] = 'images/' . $unique_name;
                }
            }
        }
    }
    
    $media = json_encode($uploaded_media_paths);
    $defaultImage = $uploaded_media_paths[0] ?? null;

    if ($id) {
        // --- 更新逻辑 ---
        // 注意: 这里的逻辑需要根据是否上传了新图片来决定是否更新 media 和 defaultImage 字段
        if (!empty($uploaded_media_paths)) {
            $sql = "UPDATE products SET name=?, description=?, category=?, media=?, defaultImage=? WHERE id=?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("ssssss", $name, $description, $category, $media, $defaultImage, $id);
        } else {
            // 如果没有上传新文件，则不更新图片相关字段
            $sql = "UPDATE products SET name=?, description=?, category=? WHERE id=?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("ssss", $name, $description, $category, $id);
        }
        
        if ($stmt === false) {
            json_response(500, ['message' => 'SQL prepare failed: ' . $conn->error]);
        }

        if ($stmt->execute()) {
            json_response(200, ['message' => '产品更新成功', 'id' => $id]);
        } else {
            json_response(500, ['message' => '产品更新失败: ' . $stmt->error]);
        }
    } else {
        // --- 创建逻辑 ---
        $new_id = 'prod_' . uniqid();
        $createdAt = date('Y-m-d H:i:s');
        
        $sql = "INSERT INTO products (id, name, description, category, media, defaultImage, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        if ($stmt === false) {
            json_response(500, ['message' => 'SQL prepare failed: ' . $conn->error]);
        }
        $stmt->bind_param("sssssss", $new_id, $name, $description, $category, $media, $defaultImage, $createdAt);
        
        if ($stmt->execute()) {
            json_response(201, ['message' => '产品创建成功', 'id' => $new_id]);
        } else {
            json_response(500, ['message' => '产品创建失败: ' . $stmt->error]);
        }
    }
    $stmt->close();
}

/**
 * 处理 DELETE 请求
 */
function handle_delete($conn) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    // 批量删除
    if (isset($data['ids']) && is_array($data['ids'])) {
        $ids_to_delete = $data['ids'];
        if (empty($ids_to_delete)) {
            json_response(400, ['message' => '没有提供要删除的 ID']);
            return;
        }

        // 为 IN 子句创建占位符
        $placeholders = implode(',', array_fill(0, count($ids_to_delete), '?'));
        $types = str_repeat('s', count($ids_to_delete));
        
        $sql = "DELETE FROM products WHERE id IN ($placeholders)";
        $stmt = $conn->prepare($sql);
        if ($stmt === false) {
            json_response(500, ['message' => 'SQL prepare failed: ' . $conn->error]);
            return;
        }
        
        $stmt->bind_param($types, ...$ids_to_delete);

        if ($stmt->execute()) {
            json_response(200, ['message' => '批量删除成功', 'deleted_count' => $stmt->affected_rows]);
        } else {
            json_response(500, ['message' => '批量删除失败: ' . $stmt->error]);
        }
        $stmt->close();
        return;
    }

    // 单个删除 (保持向后兼容)
    $id = $_GET['id'] ?? null;
    if (!$id) {
        json_response(400, ['message' => '缺少产品 ID']);
        return;
    }

    $sql = "DELETE FROM products WHERE id = ?";
    $stmt = $conn->prepare($sql);
    if ($stmt === false) {
        json_response(500, ['message' => 'SQL prepare failed: ' . $conn->error]);
        return;
    }
    $stmt->bind_param("s", $id);

    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            json_response(200, ['message' => '产品删除成功']);
        } else {
            json_response(404, ['message' => '未找到要删除的产品']);
        }
    } else {
        json_response(500, ['message' => '产品删除失败: ' . $stmt->error]);
    }
    $stmt->close();
}

/**
 * 处理 PUT 请求 (归档/恢复)
 */
function handle_put($conn) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!$data) {
        json_response(400, ['message' => '请求数据格式错误']);
        return;
    }
    
    $action = $data['action'] ?? null;
    $id = $data['id'] ?? null;
    $ids = $data['ids'] ?? null;
    
    if (!$action || (!$id && !$ids)) {
        json_response(400, ['message' => '缺少必要参数: action 和 id/ids']);
        return;
    }
    
    if (!in_array($action, ['archive', 'unarchive'])) {
        json_response(400, ['message' => '无效的操作类型，只支持 archive 或 unarchive']);
        return;
    }
    
    $archived_value = ($action === 'archive') ? 1 : 0;
    $action_text = ($action === 'archive') ? '归档' : '恢复';
    
    // 批量操作
    if ($ids && is_array($ids)) {
        if (empty($ids)) {
            json_response(400, ['message' => '没有提供要操作的 ID']);
            return;
        }
        
        $placeholders = implode(',', array_fill(0, count($ids), '?'));
        $types = str_repeat('s', count($ids)) . 'i';
        
        $sql = "UPDATE products SET archived = ? WHERE id IN ($placeholders)";
        $stmt = $conn->prepare($sql);
        if ($stmt === false) {
            json_response(500, ['message' => 'SQL prepare failed: ' . $conn->error]);
            return;
        }
        
        $params = array_merge([$archived_value], $ids);
        $stmt->bind_param($types, ...$params);
        
        if ($stmt->execute()) {
            json_response(200, [
                'message' => "成功{$action_text} {$stmt->affected_rows} 个产品", 
                'affected_count' => $stmt->affected_rows
            ]);
        } else {
            json_response(500, ['message' => "批量{$action_text}失败: " . $stmt->error]);
        }
        $stmt->close();
        return;
    }
    
    // 单个操作
    if ($id) {
        $sql = "UPDATE products SET archived = ? WHERE id = ?";
        $stmt = $conn->prepare($sql);
        if ($stmt === false) {
            json_response(500, ['message' => 'SQL prepare failed: ' . $conn->error]);
            return;
        }
        $stmt->bind_param("is", $archived_value, $id);
        
        if ($stmt->execute()) {
            if ($stmt->affected_rows > 0) {
                json_response(200, ['message' => "产品{$action_text}成功"]);
            } else {
                json_response(404, ['message' => '未找到要操作的产品']);
            }
        } else {
            json_response(500, ['message' => "产品{$action_text}失败: " . $stmt->error]);
        }
        $stmt->close();
        return;
    }
}
?>
