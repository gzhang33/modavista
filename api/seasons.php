<?php
session_start();
require_once 'config.php';
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

// 使用i18n表查询季节数据
$sql = 'SELECT
            s.id,
            COALESCE(si.name, s.season_name) AS name,
            s.season_name AS name_en
        FROM seasons s
        LEFT JOIN seasons_i18n si ON s.id = si.season_id AND si.locale = ?
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
while ($row = $result->fetch_assoc()) {
    $seasons[] = [
        'id' => $row['id'],
        'name' => $row['name']
    ];
}

$stmt->close();
$conn->close();
json_response(200, $seasons);
?>