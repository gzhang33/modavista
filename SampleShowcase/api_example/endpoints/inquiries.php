<?php
// 询价API端点 - endpoints/inquiries.php
// 处理询价相关的API请求

global $pdo, $method, $pathSegments;

switch ($method) {
    case 'GET':
        // 获取询价列表 (管理功能)
        getInquiries();
        break;
        
    case 'POST':
        // 提交新询价
        createInquiry();
        break;
        
    default:
        jsonResponse(false, null, '不支持的请求方法', 405);
        break;
}

function getInquiries() {
    global $pdo;
    
    // 获取查询参数
    $page = intval($_GET['page'] ?? 1);
    $limit = intval($_GET['limit'] ?? 20);
    $status = $_GET['status'] ?? '';
    $type = $_GET['type'] ?? '';
    
    $offset = ($page - 1) * $limit;
    
    // 构建查询条件
    $whereConditions = ['1=1'];
    $params = [];
    
    if (!empty($status)) {
        $whereConditions[] = 'status = ?';
        $params[] = $status;
    }
    
    if (!empty($type)) {
        $whereConditions[] = 'inquiry_type = ?';
        $params[] = $type;
    }
    
    $whereClause = implode(' AND ', $whereConditions);
    
    try {
        // 获取总数
        $countSql = "SELECT COUNT(*) FROM inquiries WHERE $whereClause";
        $countStmt = $pdo->prepare($countSql);
        $countStmt->execute($params);
        $total = $countStmt->fetchColumn();
        
        // 获取询价数据
        $sql = "SELECT 
                    i.id,
                    i.first_name as firstName,
                    i.last_name as lastName,
                    i.email,
                    i.company,
                    i.business_type as businessType,
                    i.message,
                    i.product_id as productId,
                    i.inquiry_type as inquiryType,
                    i.status,
                    i.ip_address as ipAddress,
                    i.created_at as createdAt,
                    p.name as productName
                FROM inquiries i
                LEFT JOIN products p ON i.product_id = p.id
                WHERE $whereClause 
                ORDER BY i.created_at DESC 
                LIMIT $limit OFFSET $offset";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $inquiries = $stmt->fetchAll();
        
        $pages = ceil($total / $limit);
        
        $responseData = [
            'inquiries' => $inquiries,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $total,
                'pages' => $pages
            ]
        ];
        
        jsonResponse(true, $responseData, '获取询价列表成功');
        
    } catch (PDOException $e) {
        error_log("获取询价列表失败: " . $e->getMessage());
        jsonResponse(false, null, '获取询价列表失败', 500);
    }
}

function createInquiry() {
    global $pdo;
    
    // 获取POST数据
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        jsonResponse(false, null, '无效的JSON数据', 400);
    }
    
    // 验证必需字段
    $requiredFields = ['firstName', 'lastName', 'email', 'company', 'businessType', 'message'];
    foreach ($requiredFields as $field) {
        if (empty($input[$field])) {
            jsonResponse(false, null, "缺少必需字段: $field", 400);
        }
    }
    
    // 验证邮箱格式
    if (!filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
        jsonResponse(false, null, '无效的邮箱地址', 400);
    }
    
    // 验证询价类型
    $validInquiryTypes = ['general', 'sample', 'catalog'];
    $inquiryType = $input['inquiryType'] ?? 'general';
    if (!in_array($inquiryType, $validInquiryTypes)) {
        $inquiryType = 'general';
    }
    
    // 获取客户端IP
    $ipAddress = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? '';
    
    try {
        // 验证产品ID（如果提供）
        $productId = null;
        if (!empty($input['productId'])) {
            $productCheckSql = "SELECT id FROM products WHERE id = ?";
            $productCheckStmt = $pdo->prepare($productCheckSql);
            $productCheckStmt->execute([$input['productId']]);
            if ($productCheckStmt->fetch()) {
                $productId = $input['productId'];
            }
        }
        
        // 插入询价记录
        $sql = "INSERT INTO inquiries (
                    first_name, last_name, email, company, business_type,
                    message, product_id, inquiry_type, status, ip_address,
                    created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, NOW())";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $input['firstName'],
            $input['lastName'],
            $input['email'],
            $input['company'],
            $input['businessType'],
            $input['message'],
            $productId,
            $inquiryType,
            $ipAddress
        ]);
        
        $inquiryId = $pdo->lastInsertId();
        
        // 可以在这里添加邮件通知功能
        // sendInquiryNotification($inquiryId, $input);
        
        jsonResponse(true, [
            'id' => $inquiryId,
            'message' => '感谢您的询价，我们将在24小时内回复您'
        ], '询价提交成功', 201);
        
    } catch (PDOException $e) {
        error_log("创建询价失败: " . $e->getMessage());
        jsonResponse(false, null, '提交询价失败，请稍后重试', 500);
    }
}

// 邮件通知功能 (可选)
function sendInquiryNotification($inquiryId, $inquiryData) {
    // 这里可以实现邮件发送功能
    // 例如使用PHPMailer或其他邮件服务
    
    // 示例代码结构:
    /*
    $to = 'admin@dreamoda.com';
    $subject = '新的询价通知 - ' . $inquiryData['company'];
    $message = "
        新的询价详情:
        公司: {$inquiryData['company']}
        联系人: {$inquiryData['firstName']} {$inquiryData['lastName']}
        邮箱: {$inquiryData['email']}
        业务类型: {$inquiryData['businessType']}
        消息: {$inquiryData['message']}
        询价ID: $inquiryId
    ";
    
    // 发送邮件
    mail($to, $subject, $message);
    */
}
?>