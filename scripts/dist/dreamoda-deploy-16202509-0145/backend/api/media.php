<?php
session_start();
// api/media.php
require_once '../config/app.php';
require_once 'utils.php';

require_auth();

$method = $_SERVER['REQUEST_METHOD'];
$images_dir = IMAGES_PRODUCTS_DIR; // 物理目录：.../public_html/product_images/products/

switch ($method) {
    case 'GET':
        get_media($images_dir);
        break;
    case 'POST': // 使用 POST 来删除，避免 URL 长度问题和 CSRF
        delete_media($images_dir);
        break;
    case 'DELETE': // 新增：批量清理孤儿图片
        cleanup_orphan_handler($images_dir);
        break;
    default:
        json_response(405, ['message' => '不支持的方法']);
        break;
}

function get_media($dir) {
    // 获取所有图片文件（仅 products 子目录）
    $files = glob(rtrim($dir, '/\\') . DIRECTORY_SEPARATOR . '{*.jpg,*.jpeg,*.png,*.gif,*.webp}', GLOB_BRACE);

    // 查询使用情况：来自 product_variants.default_image 与 product_media.image_path
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    $conn->set_charset('utf8mb4');
    if ($conn->connect_error) {
        json_response(500, ['message' => '数据库连接失败']);
    }
    $used_images = [];

    $stmt1 = $conn->prepare('SELECT default_image FROM product_variant WHERE default_image IS NOT NULL AND default_image <> ""');
    if ($stmt1 && $stmt1->execute()) {
        $res1 = $stmt1->get_result();
        while ($r = $res1->fetch_assoc()) {
            $used_images[$r['default_image']] = true;
        }
        $stmt1->close();
    }

    $stmt2 = $conn->prepare('SELECT image_path FROM product_media');
    if ($stmt2 && $stmt2->execute()) {
        $res2 = $stmt2->get_result();
        while ($r = $res2->fetch_assoc()) {
            $used_images[$r['image_path']] = true;
        }
        $stmt2->close();
    }
    $conn->close();

    $media_items = [];
    foreach ($files as $file) {
        // 数据库存储与前端使用统一为 'products/<filename>'
        $path = 'products/' . basename($file);
        $media_items[] = [
            'path' => $path,
            'is_used' => isset($used_images[$path])
        ];
    }

    json_response(200, $media_items);
}

function delete_media($dir) {
    $data = json_decode(file_get_contents("php://input"), true);
    $path_to_delete = $data['path'] ?? null;

    if (!$path_to_delete) {
        json_response(400, ['message' => '缺少文件路径']);
    }

    // 安全检查，确保路径在允许的目录下
    $real_base_dir = realpath($dir);
    // 支持传入 'products/filename.jpg' 或 '/product_images/products/filename.jpg'
    $normalized = $path_to_delete;
    if (strpos($normalized, '/product_images/products/') === 0) {
        $normalized = substr($normalized, strlen('/product_images/'));
    }
    if (strpos($normalized, 'product_images/products/') === 0) {
        $normalized = substr($normalized, strlen('product_images/'));
    }
    if (strpos($normalized, 'products/') === 0) {
        $normalized = substr($normalized, strlen('products/'));
    }
    $real_file_path = realpath(rtrim($dir, '/\\') . DIRECTORY_SEPARATOR . $normalized);
    if ($real_file_path === false) {
        json_response(404, ['message' => '文件未找到']);
    }
    if (strpos($real_file_path, $real_base_dir) !== 0) {
        json_response(403, ['message' => '禁止访问']);
    }

    if (file_exists($real_file_path)) {
        if (unlink($real_file_path)) {
            json_response(200, ['message' => '文件删除成功']);
        } else {
            json_response(500, ['message' => '文件删除失败']);
        }
    } else {
        json_response(404, ['message' => '文件未找到']);
    }
}

// 批量清理孤儿图片（当数据库中无引用时删除本地文件）
function cleanup_orphan_handler($dir) {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    if ($conn->connect_error) {
        json_response(500, ['message' => '数据库连接失败']);
    }
    $conn->set_charset('utf8mb4');

    // 构建引用集
    $referenced = [];
    $stmt1 = $conn->prepare('SELECT default_image FROM product_variant WHERE default_image IS NOT NULL AND default_image <> ""');
    if ($stmt1 && $stmt1->execute()) {
        $res1 = $stmt1->get_result();
        while ($r = $res1->fetch_assoc()) { $referenced[$r['default_image']] = true; }
        $stmt1->close();
    }
    $stmt2 = $conn->prepare('SELECT image_path FROM product_media');
    if ($stmt2 && $stmt2->execute()) {
        $res2 = $stmt2->get_result();
        while ($r = $res2->fetch_assoc()) { $referenced[$r['image_path']] = true; }
        $stmt2->close();
    }

    $patterns = ['*.jpg','*.jpeg','*.png','*.gif','*.webp'];
    $base_dir = realpath($dir);
    if ($base_dir === false) { json_response(200, ['deleted' => 0]); }
    $deleted = 0;
    $files = [];
    foreach ($patterns as $p) { $files = array_merge($files, glob($dir . $p)); }
    foreach ($files as $file) {
        $real = realpath($file);
        if ($real === false) { continue; }
        if (strpos($real, $base_dir) !== 0) { continue; }
        $basename = basename($real);
        if (in_array($basename, ['placeholder.svg','placeholder-optimized.svg'], true)) { continue; }
        // 与数据库一致：products/<filename>
        $db_path = 'products/' . $basename;
        if (!isset($referenced[$db_path])) {
            @unlink($real);
            if (!file_exists($real)) { $deleted++; }
        }
    }
    $conn->close();
    json_response(200, ['deleted' => $deleted]);
}
?> 