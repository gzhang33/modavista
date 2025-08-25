<?php
// api/language.php - 多语言管理API

require_once 'config.php';
require_once 'utils.php';

// 获取当前语言（返回标准 locale，如 en-GB）
function get_current_language() {
    // 优先级：URL参数 > Session > Cookie > 浏览器语言 > 默认语言
    $raw = null;

    if (isset($_GET['lang']) && $_GET['lang'] !== '') {
        $raw = $_GET['lang'];
    } elseif (isset($_SESSION['user_language'])) {
        $raw = $_SESSION['user_language'];
    } elseif (isset($_COOKIE['user_language'])) {
        $raw = $_COOKIE['user_language'];
    } else {
        $raw = substr($_SERVER['HTTP_ACCEPT_LANGUAGE'] ?? 'en', 0, 2);
    }

    return normalize_language_code($raw);
}

// 验证语言是否有效（适配新的locales表）
function is_valid_language($language_code) {
    $conn = get_db_connection();
    $stmt = $conn->prepare("SELECT COUNT(*) FROM locales WHERE code = ?");
    $stmt->bind_param("s", $language_code);
    $stmt->execute();
    $result = $stmt->get_result();
    $count = $result->fetch_row()[0];
    $stmt->close();
    return $count > 0;
}

// 设置用户语言偏好
function set_user_language($language_code) {
    // 统一规范化传入语言码
    $language_code = normalize_language_code($language_code);
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

    // 记录到数据库（如果user_language_preferences表存在）
    $conn = get_db_connection();
    $session_id = session_id();
    $ip_address = $_SERVER['REMOTE_ADDR'] ?? '';

    // 检查表是否存在
    $result = $conn->query("SHOW TABLES LIKE 'user_language_preferences'");
    if ($result->num_rows > 0) {
        $stmt = $conn->prepare("
            INSERT INTO user_language_preferences (session_id, ip_address, language_code)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE language_code = ?, updated_at = NOW()
        ");
        $stmt->bind_param("ssss", $session_id, $ip_address, $language_code, $language_code);
        $stmt->execute();
        $stmt->close();
    }

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
        JOIN site_content_translation sct ON sc.id = sct.content_id
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

// 获取所有可用语言（适配新的locales表）
function get_available_languages() {
    $conn = get_db_connection();
    $result = $conn->query("
        SELECT code as language_code, language_name, language_name as language_name_native,
               (sort_order = 1) as is_default
        FROM locales
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

// 获取指定语言的所有翻译（适配新的数据库结构）
function get_all_translations($language_code = null) {
    if (!$language_code) {
        $language_code = get_current_language();
    }
    // 规范化，确保为 locales.code 格式
    $language_code = normalize_language_code($language_code);

    $conn = get_db_connection();

    // 检查site_content_translation表是否存在（注意：表名是单数）
    $result = $conn->query("SHOW TABLES LIKE 'site_content_translation'");
    if ($result->num_rows == 0) {
        // 如果表不存在，返回空数组
        return [];
    }

    $stmt = $conn->prepare("
        SELECT sc.content_key, sct.translated_text
        FROM site_content sc
        JOIN site_content_translation sct ON sc.id = sct.content_id
        WHERE sct.language_code = ?
    ");
    $stmt->bind_param("s", $language_code);
    $stmt->execute();
    $result = $stmt->get_result();

    $translations = [];
    while ($row = $result->fetch_assoc()) {
        $translations[$row['content_key']] = $row['translated_text'];
    }

    $stmt->close();
    return $translations;
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

            case 'translations':
                $language_code = $_GET['lang'] ?? get_current_language();
                $translations = get_all_translations($language_code);
                json_response(200, [
                    'language' => $language_code,
                    'translations' => $translations
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

