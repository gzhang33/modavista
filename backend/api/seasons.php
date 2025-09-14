<?php
session_start();
require_once '../config/app.php';
require_once 'utils.php';

// 启用错误报告
error_reporting(E_ALL);
ini_set('display_errors', 1);

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_response(405, ["message" => "不支持的方法"]);
}

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
if ($conn->connect_error) {
    json_response(500, ["message" => "数据库连接失败: " . $conn->connect_error]);
}
$conn->set_charset("utf8mb4");

// 支持多语言查询
$raw = $_GET['lang'] ?? null;
$locale = normalize_language_code($raw);

// 检查是否需要返回映射关系（Admin界面使用）
$admin_mode = isset($_GET['admin']) && $_GET['admin'] === '1';

// 使用i18n表查询季节数据
$sql = 'SELECT
            s.id,
            COALESCE(si.name, s.season_name) AS name,
            s.season_name AS name_en,
            COALESCE(en_si.name, s.season_name) AS name_en_gb
        FROM seasons s
        LEFT JOIN seasons_i18n si ON s.id = si.season_id AND si.locale = ?
        LEFT JOIN seasons_i18n en_si ON s.id = en_si.season_id AND en_si.locale = "en-GB"
        ORDER BY s.id ASC';

$stmt = $conn->prepare($sql);
if ($stmt === false) {
    json_response(500, ["message" => "查询准备失败: " . $conn->error]);
}

$stmt->bind_param('s', $locale);
if (!$stmt->execute()) {
    json_response(500, ["message" => "查询执行失败: " . $stmt->error]);
}

$result = $stmt->get_result();
$seasons = [];
$season_mapping = []; // 意大利语 -> 英语映射

while ($row = $result->fetch_assoc()) {
    if ($admin_mode) {
        // Admin模式：返回完整的对象数组，包含映射关系
        $seasons[] = [
            'id' => $row['id'],
            'name' => $row['name'],
            'name_en_gb' => $row['name_en_gb']
        ];
    } else {
        // 普通模式：保持原有格式
        $seasons[] = [
            'id' => $row['id'],
            'name' => $row['name']
        ];
    }
    // 建立映射关系
    $season_mapping[$row['name']] = $row['name_en_gb'];
}

$stmt->close();
$conn->close();

if ($admin_mode) {
    // Admin模式：返回完整数据和映射
    json_response(200, [
        'seasons' => $seasons,
        'mapping' => $season_mapping
    ]);
} else {
    // 普通模式：保持原有格式
    json_response(200, $seasons);
}
?>