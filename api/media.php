<?php
session_start();
// api/media.php
require_once 'config.php';
require_once 'utils.php';

require_auth();

$method = $_SERVER['REQUEST_METHOD'];
$images_dir = '../images/';

switch ($method) {
    case 'GET':
        get_media($images_dir);
        break;
    case 'POST': // 使用 POST 来删除，避免 URL 长度问题和 CSRF
        delete_media($images_dir);
        break;
    default:
        json_response(405, ['message' => '不支持的方法']);
        break;
}

function get_media($dir) {
    // 获取所有图片文件
    $files = glob($dir . '{*.jpg,*.jpeg,*.png,*.gif,*.webp}', GLOB_BRACE);
    
    // 连接数据库以检查哪些图片正在被使用
    $conn = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);
    if ($conn->connect_error) {
        json_response(500, ["message" => "数据库连接失败"]);
    }
    
    $sql = "SELECT media, defaultImage FROM products";
    $result = $conn->query($sql);
    $used_images = [];
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            if (!empty($row['defaultImage'])) {
                $used_images[$row['defaultImage']] = true;
            }
            $media = json_decode($row['media'], true);
            if (is_array($media)) {
                foreach ($media as $img) {
                    $used_images[$img] = true;
                }
            }
        }
    }
    $conn->close();

    $media_items = [];
    foreach ($files as $file) {
        $path = 'images/' . basename($file);
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
    $real_file_path = realpath('../' . $path_to_delete);

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
?> 