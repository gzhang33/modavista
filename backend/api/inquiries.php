<?php
// api/inquiries.php
session_start();
require_once '../config/app.php';
require_once 'utils.php';

// CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// 只有 GET 操作需要认证（管理功能）
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
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
    default:
        json_response(405, ['message' => '不支持的方法']);
}

$conn->close();

// === GET ===
function handle_get($conn) {
    // 获取查询参数
    $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
    $limit = isset($_GET['limit']) ? min(100, max(1, (int)$_GET['limit'])) : 20;
    $status = $_GET['status'] ?? '';
    $type = $_GET['type'] ?? '';
    
    $offset = ($page - 1) * $limit;
    
    // 构建查询条件
    $where_conditions = ['1=1'];
    $params = [];
    $types = '';
    
    if (!empty($status)) {
        $where_conditions[] = 'status = ?';
        $params[] = $status;
        $types .= 's';
    }
    
    if (!empty($type)) {
        $where_conditions[] = 'inquiry_type = ?';
        $params[] = $type;
        $types .= 's';
    }
    
    $where_clause = implode(' AND ', $where_conditions);
    
    try {
        // 获取总数
        $count_sql = "SELECT COUNT(*) FROM contact_messages WHERE $where_clause";
        $count_stmt = $conn->prepare($count_sql);
        
        if (!empty($params)) {
            $count_stmt->bind_param($types, ...$params);
        }
        
        $count_stmt->execute();
        $total = $count_stmt->get_result()->fetch_row()[0];
        $count_stmt->close();
        
        // 获取询价数据
        $sql = "SELECT 
                    id,
                    SUBSTRING_INDEX(name, ' ', 1) as firstName,
                    SUBSTRING_INDEX(name, ' ', -1) as lastName,
                    email,
                    company,
                    'retail' as businessType,
                    message,
                    NULL as productId,
                    'general' as inquiryType,
                    ip_address,
                    created_at as createdAt
                FROM contact_messages 
                WHERE $where_clause 
                ORDER BY created_at DESC 
                LIMIT ? OFFSET ?";
        
        $stmt = $conn->prepare($sql);
        $bind_params = array_merge($params, [$limit, $offset]);
        $bind_types = $types . 'ii';
        $stmt->bind_param($bind_types, ...$bind_params);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $inquiries = [];
        while ($row = $result->fetch_assoc()) {
            $inquiries[] = [
                'id' => (int)$row['id'],
                'firstName' => $row['firstName'],
                'lastName' => $row['lastName'],
                'email' => $row['email'],
                'company' => $row['company'],
                'businessType' => $row['businessType'],
                'message' => $row['message'],
                'productId' => $row['productId'] ? (int)$row['productId'] : null,
                'inquiryType' => $row['inquiryType'],
                'ipAddress' => $row['ip_address'],
                'createdAt' => $row['createdAt']
            ];
        }
        $stmt->close();
        
        $pages = ceil($total / $limit);
        
        $response_data = [
            'inquiries' => $inquiries,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => (int)$total,
                'pages' => (int)$pages
            ]
        ];
        
        json_response(200, $response_data);
        
    } catch (Exception $e) {
        json_response(500, ['message' => '获取询价列表失败: ' . $e->getMessage()]);
    }
}

// === POST ===
function handle_post($conn) {
    // 获取POST数据
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        json_response(400, [
            'success' => false,
            'data' => null,
            'message' => '无效的JSON数据',
            'timestamp' => date('Y-m-d H:i:s')
        ]);
    }
    
    // 验证必需字段
    $required_fields = ['firstName', 'lastName', 'email', 'message'];
    foreach ($required_fields as $field) {
        if (empty($input[$field])) {
            json_response(400, [
                'success' => false,
                'data' => null,
                'message' => "缺少必需字段: $field",
                'timestamp' => date('Y-m-d H:i:s')
            ]);
        }
    }
    
    // 验证邮箱格式
    if (!filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
        json_response(400, [
            'success' => false,
            'data' => null,
            'message' => '无效的邮箱地址',
            'timestamp' => date('Y-m-d H:i:s')
        ]);
    }
    
    // 验证询价类型
    $valid_inquiry_types = ['general', 'sample', 'catalog'];
    $inquiry_type = $input['inquiryType'] ?? 'general';
    if (!in_array($inquiry_type, $valid_inquiry_types)) {
        $inquiry_type = 'general';
    }
    
    // 获取客户端IP
    $ip_address = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? '';
    
    try {
        // 组合姓名
        $full_name = trim($input['firstName'] . ' ' . $input['lastName']);
        
        // 处理可选字段
        $company = $input['company'] ?? '';
        $business_type = $input['businessType'] ?? 'retail';
        
        // 插入询价记录 - 包含所有必需字段
        $sql = "INSERT INTO contact_messages (
                    name, email, company, business_type, message, inquiry_type, ip_address, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())";
        
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('sssssss', 
            $full_name,
            $input['email'],
            $company,
            $business_type,
            $input['message'],
            $inquiry_type,
            $ip_address
        );
        
        if ($stmt->execute()) {
            $inquiry_id = $conn->insert_id;
            $stmt->close();
            
            // 发送邮件通知（需要配置邮件服务器）
            $email_body = "
新的询价消息

姓名: {$full_name}
邮箱: {$input['email']}
公司: " . ($input['company'] ?? '未提供') . "
业务类型: " . ($input['businessType'] ?? 'retail') . "
询价类型: {$inquiry_type}

消息:
{$input['message']}

发送时间: " . date('Y-m-d H:i:s') . "
IP地址: {$ip_address}
";
            
            // 如果有邮件配置，可以发送邮件
            // mail('Hi@DreaModa.store', '新的询价消息', $email_body, 'From: noreply@dreamoda.store');
            
            // 返回符合 ApiResponse 格式的响应
            json_response(201, [
                'success' => true,
                'data' => [
                    'id' => $inquiry_id,
                    'message' => '感谢您的询价，我们将在24小时内回复您'
                ],
                'message' => '询价提交成功',
                'timestamp' => date('Y-m-d H:i:s')
            ]);
        } else {
            $stmt->close();
            json_response(500, [
                'success' => false,
                'data' => null,
                'message' => '提交询价失败，请稍后重试',
                'timestamp' => date('Y-m-d H:i:s')
            ]);
        }
        
    } catch (Exception $e) {
        json_response(500, [
            'success' => false,
            'data' => null,
            'message' => '提交询价失败: ' . $e->getMessage(),
            'timestamp' => date('Y-m-d H:i:s')
        ]);
    }
}
?>