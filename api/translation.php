<?php
// api/translation.php - 智能多语言翻译功能
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// 开启输出缓冲，防止任何意外输出
ob_start();

require_once 'config.php';
require_once 'utils.php';

// CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// 只支持POST请求且需要认证
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(405, ['message' => '仅支持POST方法']);
}

require_auth();

$conn = get_db_connection();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'POST':
        handle_translation_request($conn);
        break;
    default:
        json_response(405, ['message' => '不支持的方法']);
}

$conn->close();

/**
 * 处理翻译请求
 */
function handle_translation_request($conn) {
    // 检查API密钥是否配置
    $api_key = getenv('OPENAI_API_KEY');
    if (!$api_key) {
        json_response(400, ['error' => ['code' => 'API_KEY_NOT_CONFIGURED', 'message' => 'OpenAI API密钥未配置，请检查.htaccess文件']]);
    }
    
    // 解析请求数据
    $raw_input = file_get_contents('php://input');
    $input = json_decode($raw_input, true);
    if (!$input) {
        json_response(400, ['error' => ['code' => 'INVALID_JSON', 'message' => '请求数据格式错误', 'raw_input' => substr($raw_input, 0, 500)]]);
    }

    // 验证必要参数
    $action = $input['action'] ?? '';
    $content = $input['content'] ?? [];
    $source_language = $input['source_language'] ?? 'cn';
    $target_languages = $input['target_languages'] ?? [];
    $product_id = isset($input['product_id']) ? (int)$input['product_id'] : null;

    if ($action !== 'translate_product' && $action !== 'save_translations') {
        json_response(400, ['error' => ['code' => 'INVALID_ACTION', 'message' => '不支持的操作类型']]);
    }

    // 根据操作类型进行不同的验证
    if ($action === 'translate_product') {
        if (empty($content['name']) && empty($content['description'])) {
            json_response(400, ['error' => ['code' => 'EMPTY_CONTENT', 'message' => '产品名称和描述不能同时为空']]);
        }

        if (empty($target_languages) || !is_array($target_languages)) {
            json_response(400, ['error' => ['code' => 'INVALID_TARGET_LANGUAGES', 'message' => '目标语言列表不能为空']]);
        }

        // 验证语言代码
        $supported_source_languages = ['cn', 'it', 'en'];
        $supported_target_languages = ['en', 'de', 'fr', 'it', 'es'];

        if (!in_array($source_language, $supported_source_languages)) {
            json_response(400, ['error' => ['code' => 'UNSUPPORTED_SOURCE_LANGUAGE', 'message' => '不支持的源语言']]);
        }

        foreach ($target_languages as $lang) {
            if (!in_array($lang, $supported_target_languages)) {
                json_response(400, ['error' => ['code' => 'UNSUPPORTED_TARGET_LANGUAGE', 'message' => "不支持的目标语言: $lang"]]);
            }
        }
    } elseif ($action === 'save_translations') {
        if (!$product_id) {
            json_response(400, ['error' => ['code' => 'MISSING_PRODUCT_ID', 'message' => '产品ID不能为空']]);
        }
    }

    // 处理翻译请求
    try {
        if ($action === 'translate_product') {
            $translations = process_translation($content, $source_language, $target_languages, $product_id, $conn);
            
            json_response(200, [
                'success' => true,
                'data' => [
                    'translations' => $translations
                ],
                'metadata' => [
                    'provider' => 'openai',
                    'timestamp' => date('c'),
                    'source_language' => $source_language,
                    'target_languages' => $target_languages
                ]
            ]);
        } elseif ($action === 'save_translations') {
            $translations = $input['translations'] ?? [];
            if (empty($translations)) {
                json_response(400, ['error' => ['code' => 'EMPTY_TRANSLATIONS', 'message' => '翻译内容不能为空']]);
            }

            // 1) 校验产品是否存在
            $chk = $conn->prepare('SELECT 1 FROM product WHERE id = ?');
            if (!$chk) { json_response(500, ['error' => ['code' => 'DB_PREPARE_FAILED', 'message' => '校验产品失败: ' . $conn->error]]); }
            $chk->bind_param('i', $product_id);
            if (!$chk->execute()) { $chk->close(); json_response(500, ['error' => ['code' => 'DB_EXECUTE_FAILED', 'message' => '校验产品失败: ' . $conn->error]]); }
            $exists = $chk->get_result()->fetch_row();
            $chk->close();
            if (!$exists) {
                json_response(404, ['error' => ['code' => 'PRODUCT_NOT_FOUND', 'message' => '产品不存在']]);
            }

            // 2) 事务写入 i18n 与日志，保证原子性
            $conn->begin_transaction();
            try {
                save_translations_to_i18n($conn, $product_id, $translations);
                $conn->commit();
            } catch (Throwable $txe) {
                $conn->rollback();
                json_response(500, ['error' => ['code' => 'TX_FAILED', 'message' => '保存翻译失败: ' . $txe->getMessage()]]);
            }

            json_response(200, [
                'success' => true,
                'message' => '翻译内容已保存到数据库'
            ]);
        }
    } catch (Exception $e) {
        error_log("Translation error: " . $e->getMessage());
        json_response(500, ['error' => ['code' => 'TRANSLATION_FAILED', 'message' => $e->getMessage()]]);
    }
}

/**
 * 执行翻译处理
 */
function process_translation($content, $source_language, $target_languages, $product_id, $conn) {
    $translations = [
        'name' => [],
        'description' => []
    ];

    foreach ($target_languages as $target_lang) {
        // 翻译产品名称
        if (!empty($content['name'])) {
            $cached_name = get_cached_translation($content['name'], $source_language, $target_lang);
            if ($cached_name) {
                $translations['name'][$target_lang] = $cached_name;
            } else {
                $translated_name = call_openai_api($content['name'], $source_language, $target_lang, 'name');
                $translations['name'][$target_lang] = $translated_name;
                
                // 缓存翻译结果
                cache_translation($content['name'], $source_language, $target_lang, $translated_name);
                
                // 记录翻译日志
                if ($product_id) {
                    log_translation($conn, $product_id, 'name', $source_language, $target_lang, $content['name'], $translated_name);
                }
            }
        }

        // 翻译产品描述
        if (!empty($content['description'])) {
            $cached_description = get_cached_translation($content['description'], $source_language, $target_lang);
            if ($cached_description) {
                $translations['description'][$target_lang] = $cached_description;
            } else {
                $translated_description = call_openai_api($content['description'], $source_language, $target_lang, 'description');
                $translations['description'][$target_lang] = $translated_description;
                
                // 缓存翻译结果
                cache_translation($content['description'], $source_language, $target_lang, $translated_description);
                
                // 记录翻译日志
                if ($product_id) {
                    log_translation($conn, $product_id, 'description', $source_language, $target_lang, $content['description'], $translated_description);
                }
            }
        }
    }

    return $translations;
}

/**
 * 调用OpenAI API进行翻译
 */
function call_openai_api($text, $source_lang, $target_lang, $content_type) {
    $api_key = getenv('OPENAI_API_KEY');
    if (!$api_key) {
        throw new Exception('OpenAI API密钥未配置');
    }
    
    // 验证输入参数
    if (empty(trim($text))) {
        throw new Exception('翻译文本不能为空');
    }

    // 语言映射
    $language_names = [
        'cn' => '中文',
        'it' => '意大利语', 
        'en' => '英语',
        'de' => '德语',
        'fr' => '法语',
        'es' => '西班牙语'
    ];

    $source_name = $language_names[$source_lang] ?? $source_lang;
    $target_name = $language_names[$target_lang] ?? $target_lang;

    // 构建提示词
    if ($content_type === 'name') {
        $prompt = (
            "你是一个专业的时尚产品翻译专家。\n"
            . "请将以下产品名称从{$source_name}翻译成{$target_name}，保持品牌调性和专业性：\n\n"
            . "{$text}\n\n"
            . "要求：\n"
            . "1. 保持时尚行业的专业术语；\n"
            . "2. 符合目标语言的文化习惯；\n"
            . "3. 保持原文的营销效果；\n"
            . "4. 简洁明了，适合电商展示。\n\n"
            . "请直接输出翻译结果，不要添加任何解释、问候语或其他文字。"
        );
    } else {
        $prompt = (
            "你是一个专业的时尚产品翻译专家。\n"
            . "请将以下产品描述从{$source_name}翻译成{$target_name}，保持专业性和营销效果：\n\n"
            . "{$text}\n\n"
            . "要求：\n"
            . "1. 保持时尚行业的专业术语；\n"
            . "2. 符合目标语言的文化习惯；\n"
            . "3. 保持原文的营销效果；\n"
            . "4. 简洁明了，适合电商展示。\n\n"
            . "请直接输出翻译结果，不要添加任何解释、问候语或其他文字。"
        );
    }

    $data = [
        'model' => 'gpt-4o-mini',
        'messages' => [
            [
                'role' => 'user',
                'content' => $prompt
            ]
        ],
        'max_tokens' => 1000,
        'temperature' => 0.3
    ];

    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => 'https://api.openai.com/v1/chat/completions',
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($data),
        CURLOPT_HTTPHEADER => [
            'Authorization: Bearer ' . $api_key,
            'Content-Type: application/json'
        ],
        CURLOPT_TIMEOUT => 30
    ]);

    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curl_error = curl_error($ch);
    curl_close($ch);

    if ($curl_error) {
        throw new Exception("网络请求失败: $curl_error");
    }

    if ($http_code !== 200) {
        $error_data = json_decode($response, true);
        $error_message = $error_data['error']['message'] ?? "API调用失败 (HTTP $http_code)";
        throw new Exception($error_message);
    }

    $result = json_decode($response, true);
    if (!$result || !isset($result['choices'][0]['message']['content'])) {
        throw new Exception('API响应格式错误');
    }

    return trim($result['choices'][0]['message']['content']);
}

/**
 * 获取缓存的翻译结果
 */
function get_cached_translation($text, $source_lang, $target_lang) {
    $cache_dir = dirname(__DIR__) . '/cache/translations/';
    if (!is_dir($cache_dir)) {
        return null;
    }

    $cache_key = md5($source_lang . '|' . $target_lang . '|' . $text);
    $cache_file = $cache_dir . $cache_key . '.cache';

    if (!file_exists($cache_file)) {
        return null;
    }

    // 检查缓存是否过期（24小时）
    if (filemtime($cache_file) < time() - 86400) {
        @unlink($cache_file);
        return null;
    }

    $cached_data = file_get_contents($cache_file);
    return $cached_data ?: null;
}

/**
 * 缓存翻译结果
 */
function cache_translation($text, $source_lang, $target_lang, $translation) {
    $cache_dir = dirname(__DIR__) . '/cache/translations/';
    if (!is_dir($cache_dir)) {
        mkdir($cache_dir, 0755, true);
    }

    $cache_key = md5($source_lang . '|' . $target_lang . '|' . $text);
    $cache_file = $cache_dir . $cache_key . '.cache';

    file_put_contents($cache_file, $translation);
}

/**
 * 记录翻译日志
 */
function log_translation($conn, $product_id, $content_type, $source_language, $target_language, $original_text, $translated_text) {
    $stmt = $conn->prepare("
        INSERT INTO translation_logs 
        (product_id, content_type, source_language, target_language, original_text, translated_text, translation_provider) 
        VALUES (?, ?, ?, ?, ?, ?, 'openai')
    ");
    
    if ($stmt) {
        $stmt->bind_param('isssss', $product_id, $content_type, $source_language, $target_language, $original_text, $translated_text);
        $stmt->execute();
        $stmt->close();
    }
}

/**
 * 保存翻译结果到i18n表
 */
function save_translations_to_i18n($conn, $product_id, $translations) {
    foreach ($translations as $content_type => $langs) {
        foreach ($langs as $locale => $text) {
            // 规范化语言代码
            $normalized_locale = normalize_language_code($locale);
            
            if ($content_type === 'name') {
                $stmt = $conn->prepare("
                    INSERT INTO product_i18n (product_id, locale, name, status, translation_timestamp) 
                    VALUES (?, ?, ?, 'published', CURRENT_TIMESTAMP)
                    ON DUPLICATE KEY UPDATE 
                    name = VALUES(name), 
                    translation_timestamp = CURRENT_TIMESTAMP
                ");
                if ($stmt) {
                    $stmt->bind_param('iss', $product_id, $normalized_locale, $text);
                    $stmt->execute();
                    $stmt->close();
                }
                
                // 记录翻译日志
                log_translation($conn, $product_id, 'name', 'cn', $normalized_locale, '', $text);
            } elseif ($content_type === 'description') {
                $stmt = $conn->prepare("
                    INSERT INTO product_i18n (product_id, locale, description, status, translation_timestamp) 
                    VALUES (?, ?, ?, 'published', CURRENT_TIMESTAMP)
                    ON DUPLICATE KEY UPDATE 
                    description = VALUES(description), 
                    translation_timestamp = CURRENT_TIMESTAMP
                ");
                if ($stmt) {
                    $stmt->bind_param('iss', $product_id, $normalized_locale, $text);
                    $stmt->execute();
                    $stmt->close();
                }
                
                // 记录翻译日志
                log_translation($conn, $product_id, 'description', 'cn', $normalized_locale, '', $text);
            }
        }
    }
}
?>
