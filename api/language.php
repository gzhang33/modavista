<?php
// api/language.php - 多语言管理API

require_once 'config.php';
require_once 'utils.php';

// 获取当前语言
function get_current_language() {
    // 优先级：URL参数 > Session > Cookie > 浏览器语言 > 默认语言
    $language = 'en'; // 默认语言
    
    // 1. 检查URL参数
    if (isset($_GET['lang']) && !empty($_GET['lang'])) {
        $language = $_GET['lang'];
    }
    // 2. 检查Session
    elseif (isset($_SESSION['user_language'])) {
        $language = $_SESSION['user_language'];
    }
    // 3. 检查Cookie
    elseif (isset($_COOKIE['user_language'])) {
        $language = $_COOKIE['user_language'];
    }
    // 4. 检查浏览器语言
    else {
        $browser_lang = substr($_SERVER['HTTP_ACCEPT_LANGUAGE'] ?? 'en', 0, 2);
        if (is_valid_language($browser_lang)) {
            $language = $browser_lang;
        }
    }
    
    return $language;
}

// 验证语言是否有效
function is_valid_language($language_code) {
    $valid_languages = ['en', 'it', 'fr', 'de', 'es', 'pt', 'nl', 'pl'];
    return in_array($language_code, $valid_languages);
}

// 设置用户语言偏好
function set_user_language($language_code) {
    if (!is_valid_language($language_code)) {
        return false;
    }
    
    // 设置Session
    if (session_status() == PHP_SESSION_NONE) {
        session_start();
    }
    $_SESSION['user_language'] = $language_code;
    
    // 设置Cookie (30天)
    setcookie('user_language', $language_code, time() + (30 * 24 * 60 * 60), '/');
    
    // 记录到数据库
    $conn = get_db_connection();
    $session_id = session_id();
    $ip_address = $_SERVER['REMOTE_ADDR'] ?? '';
    
    $stmt = $conn->prepare("
        INSERT INTO user_language_preferences (session_id, ip_address, language_code) 
        VALUES (?, ?, ?) 
        ON DUPLICATE KEY UPDATE language_code = ?, updated_at = NOW()
    ");
    $stmt->bind_param("ssss", $session_id, $ip_address, $language_code, $language_code);
    $stmt->execute();
    $stmt->close();
    
    return true;
}

// 获取翻译文本
function get_translation($content_key, $language_code = null) {
    if (!$language_code) {
        $language_code = get_current_language();
    }
    
    $conn = get_db_connection();
    $stmt = $conn->prepare("
        SELECT sct.translated_text 
        FROM site_content sc 
        JOIN site_content_translations sct ON sc.id = sct.content_id 
        WHERE sc.content_key = ? AND sct.language_code = ?
    ");
    $stmt->bind_param("ss", $content_key, $language_code);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        $stmt->close();
        return $row['translated_text'];
    }
    
    // 如果找不到翻译，返回英文版本
    if ($language_code !== 'en') {
        return get_translation($content_key, 'en');
    }
    
    $stmt->close();
    return $content_key; // 最后返回键名
}

// 获取所有可用语言
function get_available_languages() {
    $conn = get_db_connection();
    $result = $conn->query("
        SELECT language_code, language_name, language_name_native, is_default 
        FROM languages 
        WHERE is_active = 1 
        ORDER BY sort_order, language_name
    ");
    
    $languages = [];
    while ($row = $result->fetch_assoc()) {
        $languages[] = $row;
    }
    
    return $languages;
}

// 获取多语言字段值
function get_localized_field($table, $field, $id, $language_code = null) {
    if (!$language_code) {
        $language_code = get_current_language();
    }
    
    $conn = get_db_connection();
    $localized_field = $field . '_' . $language_code;
    
    // 检查字段是否存在
    $result = $conn->query("SHOW COLUMNS FROM `$table` LIKE '$localized_field'");
    if ($result->num_rows == 0) {
        // 如果本地化字段不存在，返回原始字段
        $stmt = $conn->prepare("SELECT `$field` FROM `$table` WHERE id = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        $stmt->close();
        return $row[$field] ?? '';
    }
    
    // 获取本地化字段值
    $stmt = $conn->prepare("SELECT `$localized_field`, `$field` FROM `$table` WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();
    $stmt->close();
    
    // 如果本地化字段为空，返回原始字段
    return !empty($row[$localized_field]) ? $row[$localized_field] : $row[$field];
}

// API端点处理
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$action = $_GET['action'] ?? '';

switch ($method) {
    case 'GET':
        switch ($action) {
            case 'languages':
                json_response(200, [
                    'languages' => get_available_languages(),
                    'current' => get_current_language()
                ]);
                break;
                
            case 'translation':
                $content_key = $_GET['key'] ?? '';
                if (empty($content_key)) {
                    json_response(400, ['error' => 'Missing content key']);
                }
                json_response(200, [
                    'key' => $content_key,
                    'text' => get_translation($content_key)
                ]);
                break;
                
            default:
                json_response(200, [
                    'current_language' => get_current_language(),
                    'available_languages' => get_available_languages()
                ]);
        }
        break;
        
    case 'POST':
        switch ($action) {
            case 'set_language':
                $data = json_decode(file_get_contents('php://input'), true);
                $language_code = $data['language_code'] ?? '';
                
                if (set_user_language($language_code)) {
                    json_response(200, ['message' => 'Language updated successfully']);
                } else {
                    json_response(400, ['error' => 'Invalid language code']);
                }
                break;
                
            default:
                json_response(404, ['error' => 'Action not found']);
        }
        break;
        
    default:
        json_response(405, ['error' => 'Method not allowed']);
}
?>

