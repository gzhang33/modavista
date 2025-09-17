<?php
require_once __DIR__ . '/../config/app.php';
require_once __DIR__ . '/../config/environment_adapter.php';

// 设置响应头
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// 处理预检请求
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 检查会话
session_start();
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    error_log("Contact messages API: Session not authenticated");
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit();
}

try {
    error_log("Contact messages API: Starting request");
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    if ($conn->connect_error) {
        error_log("Contact messages API: Database connection failed: " . $conn->connect_error);
        throw new Exception('Database connection failed: ' . $conn->connect_error);
    }
    $conn->set_charset('utf8mb4');
    error_log("Contact messages API: Database connected successfully");
    
    // 获取联系表单消息
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $sql = "SELECT 
                    id,
                    name,
                    email,
                    message,
                    ip_address,
                    created_at,
                    is_processed,
                    processed_at,
                    todo_status,
                    todo_notes
                FROM contact_messages 
                ORDER BY created_at DESC";
        
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            throw new Exception('Failed to prepare statement: ' . $conn->error);
        }
        
        $stmt->execute();
        $result = $stmt->get_result();
        error_log("Contact messages API: Query executed, rows found: " . $result->num_rows);
        
        $messages = [];
        while ($row = $result->fetch_assoc()) {
            $messages[] = [
                'id' => (int)$row['id'],
                'name' => $row['name'],
                'email' => $row['email'],
                'message' => $row['message'],
                'ip_address' => $row['ip_address'],
                'created_at' => $row['created_at'],
                'is_processed' => (bool)$row['is_processed'],
                'processed_at' => $row['processed_at'],
                'todo' => [
                    'status' => $row['todo_status'] ?: '待定',
                    'notes' => $row['todo_notes']
                ]
            ];
        }
        
        $stmt->close();
        
        echo json_encode([
            'success' => true,
            'data' => $messages,
            'count' => count($messages)
        ]);
        
    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // 处理待办事项更新
        $input = json_decode(file_get_contents('php://input'), true);
        $action = $input['action'] ?? '';
        
        if ($action === 'update_todo') {
            $message_id = (int)($input['message_id'] ?? 0);
            $status = $input['status'] ?? '待定';
            $notes = $input['notes'] ?? '';
            
            if (!$message_id) {
                throw new Exception('Message ID is required');
            }
            
            // 更新待办事项信息到contact_messages表
            $is_processed = ($status === '完成') ? 1 : 0;
            $processed_at = ($status === '完成') ? date('Y-m-d H:i:s') : null;
            
            $update_sql = "UPDATE contact_messages SET 
                            todo_status = ?, 
                            todo_notes = ?, 
                            is_processed = ?, 
                            processed_at = ?
                            WHERE id = ?";
            $update_stmt = $conn->prepare($update_sql);
            $update_stmt->bind_param('ssisi', $status, $notes, $is_processed, $processed_at, $message_id);
            $update_stmt->execute();
            $update_stmt->close();
            
            echo json_encode([
                'success' => true,
                'message' => 'Todo updated successfully'
            ]);
        } else {
            throw new Exception('Invalid action');
        }
        
    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
    }
    
} catch (Exception $e) {
    error_log("Contact messages API error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'error' => 'Internal server error',
        'message' => $e->getMessage()
    ]);
} finally {
    if (isset($conn)) {
        $conn->close();
    }
}
?>
