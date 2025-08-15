<?php
declare(strict_types=1);

session_start();
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/utils.php';

// 仅限已登录管理员访问
require_auth();

header('Content-Type: application/json; charset=utf-8');

// 保证所有错误以 JSON 形式返回，避免输出 HTML 错误页面
ini_set('display_errors', '0');
set_exception_handler(function($e) {
    json_response(500, [
        'success' => false,
        'message' => '服务器内部异常',
    ]);
});
set_error_handler(function($errno, $errstr, $errfile = '', $errline = 0) {
    json_response(500, [
        'success' => false,
        'message' => '服务器错误',
    ]);
});

$conn = @new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
if ($conn->connect_error) {
    json_response(500, ['success' => false, 'message' => '数据库连接失败']);
}
$conn->set_charset('utf8mb4');

$type = isset($_GET['type']) ? trim((string)$_GET['type']) : '';

// 统一响应结构
function respond_success(string $type, array $items): void {
    json_response(200, [
        'success' => true,
        'type' => $type,
        'items' => $items,
    ]);
}

switch ($type) {
    case 'products_count':
        // 汇总：产品总数（按变体统计）
        $sql = 'SELECT COUNT(*) AS cnt FROM product_variants';
        $stmt = $conn->prepare($sql);
        if (!$stmt || !$stmt->execute()) {
            if ($stmt) $stmt->close();
            $conn->close();
            json_response(500, ['success' => false, 'message' => '查询失败']);
        }
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        $items = [[ 'label' => 'products', 'value' => (int)($row['cnt'] ?? 0) ]];
        $stmt->close();
        $conn->close();
        respond_success($type, $items);
        break;

    case 'categories_count':
        // 汇总：分类总数
        $sql = 'SELECT COUNT(*) AS cnt FROM categories';
        $stmt = $conn->prepare($sql);
        if (!$stmt || !$stmt->execute()) {
            if ($stmt) $stmt->close();
            $conn->close();
            json_response(500, ['success' => false, 'message' => '查询失败']);
        }
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        $items = [[ 'label' => 'categories', 'value' => (int)($row['cnt'] ?? 0) ]];
        $stmt->close();
        $conn->close();
        respond_success($type, $items);
        break;

    case 'latest_products':
        // 列表：最近新增产品（按变体）
        // 参数 limit（默认5）
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 5;
        if ($limit <= 0 || $limit > 50) { $limit = 5; }
        $sql = 'SELECT v.id,
                       CONCAT(p.base_name, " - ", IFNULL(c.color_name, "")) AS name,
                       v.created_at AS createdAt
                FROM product_variants v
                JOIN products p ON v.product_id = p.id
                LEFT JOIN colors c ON v.color_id = c.id
                ORDER BY v.created_at DESC
                LIMIT ?';
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            $conn->close();
            json_response(500, ['success' => false, 'message' => '查询准备失败']);
        }
        $stmt->bind_param('i', $limit);
        if (!$stmt->execute()) {
            $stmt->close();
            $conn->close();
            json_response(500, ['success' => false, 'message' => '查询执行失败']);
        }
        $result = $stmt->get_result();
        $items = [];
        while ($row = $result->fetch_assoc()) {
            $items[] = [
                'id' => (int)$row['id'],
                'name' => (string)$row['name'],
                'createdAt' => (string)$row['createdAt']
            ];
        }
        $stmt->close();
        $conn->close();
        respond_success($type, $items);
        break;

    case 'products_per_category':
        // 统计每个分类下的产品总数（按变体计数）
        // 返回: [{ label: category_name, value: product_count }]
        $sql = 'SELECT c.category_name AS category_name, COUNT(v.id) AS product_count
                FROM categories c
                LEFT JOIN products p ON p.category_id = c.id
                LEFT JOIN product_variants v ON v.product_id = p.id
                GROUP BY c.id, c.category_name
                ORDER BY product_count DESC, c.category_name ASC';
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            $conn->close();
            json_response(500, ['success' => false, 'message' => '查询准备失败']);
        }
        if (!$stmt->execute()) {
            $stmt->close();
            $conn->close();
            json_response(500, ['success' => false, 'message' => '查询执行失败']);
        }
        $result = $stmt->get_result();
        $items = [];
        while ($row = $result->fetch_assoc()) {
            $items[] = [
                'label' => (string)$row['category_name'],
                'value' => (int)$row['product_count'],
            ];
        }
        $stmt->close();
        $conn->close();
        respond_success($type, $items);
        break;

    case 'category_distribution':
        // 与 products_per_category 相同，作为更直观的别名（按变体计数）
        $sql = 'SELECT c.category_name AS category_name, COUNT(v.id) AS product_count
                FROM categories c
                LEFT JOIN products p ON p.category_id = c.id
                LEFT JOIN product_variants v ON v.product_id = p.id
                GROUP BY c.id, c.category_name
                ORDER BY product_count DESC, c.category_name ASC';
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            $conn->close();
            json_response(500, ['success' => false, 'message' => '查询准备失败']);
        }
        if (!$stmt->execute()) {
            $stmt->close();
            $conn->close();
            json_response(500, ['success' => false, 'message' => '查询执行失败']);
        }
        $result = $stmt->get_result();
        $items = [];
        while ($row = $result->fetch_assoc()) {
            $items[] = [
                'label' => (string)$row['category_name'],
                'value' => (int)$row['product_count'],
            ];
        }
        $stmt->close();
        $conn->close();
        respond_success($type, $items);
        break;

    case 'new_products_over_time':
        // 按月份统计新增产品数量（按变体创建时间）
        // 返回: [{ label: 'YYYY-MM', value: count }]
        $sql = "SELECT DATE_FORMAT(v.created_at, '%Y-%m') AS ym, COUNT(*) AS cnt
                FROM product_variants v
                GROUP BY ym
                ORDER BY ym ASC";
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            $conn->close();
            json_response(500, ['success' => false, 'message' => '查询准备失败']);
        }
        if (!$stmt->execute()) {
            $stmt->close();
            $conn->close();
            json_response(500, ['success' => false, 'message' => '查询执行失败']);
        }
        $result = $stmt->get_result();
        $items = [];
        while ($row = $result->fetch_assoc()) {
            $items[] = [
                'label' => (string)$row['ym'],
                'value' => (int)$row['cnt'],
            ];
        }
        $stmt->close();
        $conn->close();
        respond_success($type, $items);
        break;

    default:
        $conn->close();
        json_response(400, ['success' => false, 'message' => '未知的分析类型', 'type' => $type]);
}

?>


