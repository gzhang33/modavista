<?php
session_start();
require_once 'config.php';
require_once 'utils.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_response(405, ["message" => "不支持的方法"]);
}

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
if ($conn->connect_error) {
    json_response(500, ["message" => "数据库连接失败: " . $conn->connect_error]);
}
$conn->set_charset("utf8mb4");

$sql = "SELECT id, season_name as name FROM seasons ORDER BY id ASC";

$result = $conn->query($sql);

if ($result === false) {
    json_response(500, ["message" => "查询执行失败: " . $conn->error]);
}

$seasons = [];
while ($row = $result->fetch_assoc()) {
    $seasons[] = $row;
}

$conn->close();
json_response(200, $seasons);
?>