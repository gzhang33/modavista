<?php
// api/translation.php - 智能多语言翻译功能
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// 开启输出缓冲，防止任何意外输出
ob_start();

require_once 'config.php';
require_once 'utils.php';
require_once 'error_messages.php';

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
        json_error_response(400, 'API_KEY_NOT_CONFIGURED');
    }
    
    // 解析请求数据
    $raw_input = file_get_contents('php://input');
    $input = json_decode($raw_input, true);
    if (!$input) {
        json_error_response(400, 'INVALID_JSON');
    }

    // 验证必要参数
    $action = $input['action'] ?? '';
    $content = $input['content'] ?? [];
    $source_language = $input['source_language'] ?? 'cn';
    $target_languages = $input['target_languages'] ?? [];
    $product_id = isset($input['product_id']) ? (int)$input['product_id'] : null;
    $is_new_product = isset($input['is_new_product']) ? (bool)$input['is_new_product'] : false;

    if ($action !== 'translate_product' && $action !== 'save_translations' && $action !== 'cleanup_logs') {
        json_error_response(400, 'INVALID_ACTION');
    }

    // 根据操作类型进行不同的验证
    if ($action === 'translate_product') {
        if (empty($content['name']) && empty($content['description'])) {
            json_error_response(400, 'EMPTY_CONTENT');
        }

        if (empty($target_languages) || !is_array($target_languages)) {
            json_error_response(400, 'INVALID_TARGET_LANGUAGES');
        }

        // 验证语言代码（基于数据库中实际支持的语言）
        $supported_source_languages = ['cn', 'it', 'en'];
        
        // 从数据库获取实际支持的目标语言
        $conn_check = get_db_connection();
        $result = $conn_check->query("SELECT code FROM locales ORDER BY sort_order");
        $supported_target_locales = [];
        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $code = $row['code'];
                $supported_target_locales[] = $code;
                // 同时支持简短格式（如en-GB -> en）
                $short_code = substr($code, 0, 2);
                if (!in_array($short_code, $supported_target_locales)) {
                    $supported_target_locales[] = $short_code;
                }
            }
        }

        if (!in_array($source_language, $supported_source_languages)) {
            json_error_response(400, 'UNSUPPORTED_SOURCE_LANGUAGE');
        }

        foreach ($target_languages as $lang) {
            if (!in_array($lang, $supported_target_locales)) {
                json_error_response(400, 'UNSUPPORTED_TARGET_LANGUAGE', ['lang' => $lang]);
            }
        }
    } elseif ($action === 'save_translations') {
        if (!$product_id) {
            json_error_response(400, 'MISSING_PRODUCT_ID');
        }
    }

    // 处理翻译请求
    try {
        if ($action === 'translate_product') {
            $translations = process_translation($content, $source_language, $target_languages, $product_id, $conn, $is_new_product);
            
            // 自动保存翻译结果到product_i18n表（仅对已存在的产品）
            if (!empty($translations) && $product_id && !$is_new_product) {
                try {
                    $conn->begin_transaction();
                    save_translations_to_i18n($conn, $product_id, $translations);
                    $conn->commit();
                    error_log("Auto-saved translations to product_i18n for product_id: $product_id");
                } catch (Exception $save_error) {
                    $conn->rollback();
                    error_log("Failed to auto-save translations: " . $save_error->getMessage());
                }
            } elseif ($is_new_product) {
                error_log("New product translation: skipping auto-save, will save after product creation");
            }
            
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
        } elseif ($action === 'cleanup_logs') {
            // 参数：保留天数与干跑
            $days_to_keep = isset($input['days_to_keep']) ? (int)$input['days_to_keep'] : 30;
            if ($days_to_keep < 1) { $days_to_keep = 1; }
            if ($days_to_keep > 3650) { $days_to_keep = 3650; }
            $dry_run = isset($input['dry_run']) ? (bool)$input['dry_run'] : true;
            $provider = isset($input['provider']) && trim($input['provider']) !== '' ? trim((string)$input['provider']) : null;

            // 计算截止时间（用绑定参数避免INTERVAL绑定限制）
            $cutoff_ts = date('Y-m-d H:i:s', time() - ($days_to_keep * 86400));

            // 统计将被删除的行数
            if ($provider) {
                $stmt_count = $conn->prepare('SELECT COUNT(*) AS c FROM translation_logs WHERE translation_timestamp < ? AND translation_provider = ?');
                if (!$stmt_count) { json_response(500, ['error' => ['code' => 'DB_PREPARE_FAILED', 'message' => '统计失败: ' . $conn->error]]); }
                $stmt_count->bind_param('ss', $cutoff_ts, $provider);
            } else {
                $stmt_count = $conn->prepare('SELECT COUNT(*) AS c FROM translation_logs WHERE translation_timestamp < ?');
                if (!$stmt_count) { json_response(500, ['error' => ['code' => 'DB_PREPARE_FAILED', 'message' => '统计失败: ' . $conn->error]]); }
                $stmt_count->bind_param('s', $cutoff_ts);
            }
            $stmt_count->execute();
            $res_count = $stmt_count->get_result();
            $rowc = $res_count ? $res_count->fetch_assoc() : ['c' => 0];
            $to_delete = (int)($rowc['c'] ?? 0);
            $stmt_count->close();

            $deleted = 0;
            if (!$dry_run && $to_delete > 0) {
                if ($provider) {
                    $stmt_del = $conn->prepare('DELETE FROM translation_logs WHERE translation_timestamp < ? AND translation_provider = ?');
                    if (!$stmt_del) { json_response(500, ['error' => ['code' => 'DB_PREPARE_FAILED', 'message' => '删除准备失败: ' . $conn->error]]); }
                    $stmt_del->bind_param('ss', $cutoff_ts, $provider);
                } else {
                    $stmt_del = $conn->prepare('DELETE FROM translation_logs WHERE translation_timestamp < ?');
                    if (!$stmt_del) { json_response(500, ['error' => ['code' => 'DB_PREPARE_FAILED', 'message' => '删除准备失败: ' . $conn->error]]); }
                    $stmt_del->bind_param('s', $cutoff_ts);
                }
                if (!$stmt_del->execute()) {
                    $msg = '删除执行失败: ' . $stmt_del->error;
                    $stmt_del->close();
                    json_response(500, ['error' => ['code' => 'DB_EXECUTE_FAILED', 'message' => $msg]]);
                }
                $deleted = $stmt_del->affected_rows;
                $stmt_del->close();
            }

            json_response(200, [
                'success' => true,
                'data' => [
                    'days_to_keep' => $days_to_keep,
                    'cutoff' => $cutoff_ts,
                    'provider' => $provider,
                    'matched' => $to_delete,
                    'deleted' => $dry_run ? 0 : $deleted,
                    'dry_run' => $dry_run
                ],
                'message' => $dry_run ? '干跑模式：未实际删除任何记录' : '清理完成'
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
function process_translation($content, $source_language, $target_languages, $product_id, $conn, $is_new_product = false) {
    $translations = [
        'name' => [],
        'description' => []
    ];

    // 限制同时处理的语言数量，避免超时和内存问题
    $max_languages = 5; // 一次最多处理5种语言
    $target_languages = array_slice($target_languages, 0, $max_languages);

    foreach ($target_languages as $target_lang) {
        try {
            // 翻译产品名称
            if (!empty($content['name'])) {
                $cached_name = get_cached_translation($content['name'], $source_language, $target_lang);
                if ($cached_name) {
                    $translations['name'][$target_lang] = $cached_name;
                } else {
                    $translated_name = call_openai_api($content['name'], $source_language, $target_lang, 'name');
                    $translations['name'][$target_lang] = $translated_name;
                    
                    // 缓存翻译结果（忽略缓存错误）
                    try {
                        cache_translation($content['name'], $source_language, $target_lang, $translated_name);
                    } catch (Exception $e) {
                        error_log("Cache error: " . $e->getMessage());
                    }
                    
                    // 记录翻译日志（仅对已存在的产品，忽略日志错误）
                    if ($product_id && !$is_new_product) {
                        try {
                            log_translation($conn, $product_id, 'name', $source_language, $target_lang, $content['name'], $translated_name);
                        } catch (Exception $e) {
                            error_log("Log error: " . $e->getMessage());
                        }
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
                    
                    // 缓存翻译结果（忽略缓存错误）
                    try {
                        cache_translation($content['description'], $source_language, $target_lang, $translated_description);
                    } catch (Exception $e) {
                        error_log("Cache error: " . $e->getMessage());
                    }
                    
                    // 记录翻译日志（仅对已存在的产品，忽略日志错误）
                    if ($product_id && !$is_new_product) {
                        try {
                            log_translation($conn, $product_id, 'description', $source_language, $target_lang, $content['description'], $translated_description);
                        } catch (Exception $e) {
                            error_log("Log error: " . $e->getMessage());
                        }
                    }
                }
            }
        } catch (Exception $e) {
            // 单个语言翻译失败不影响其他语言，但要详细记录错误
            $error_msg = "Translation failed for language $target_lang: " . $e->getMessage();
            error_log($error_msg);
            
            // 记录失败的翻译日志（仅对已存在的产品）
            if ($product_id && !$is_new_product) {
                try {
                    foreach (['name', 'description'] as $content_type) {
                        if (!empty($content[$content_type])) {
                            log_translation($conn, $product_id, $content_type, $source_language, $target_lang, $content[$content_type], "[FAILED: " . $e->getMessage() . "]");
                        }
                    }
                } catch (Exception $log_error) {
                    error_log("Failed to log translation error: " . $log_error->getMessage());
                }
            }
            
            continue;
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
    
    // 记录翻译请求
    error_log("Starting translation: {$source_lang} -> {$target_lang} [{$content_type}]: " . substr($text, 0, 50) . "...");

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
        error_log("Invalid API response format: " . substr($response, 0, 200));
        throw new Exception('API响应格式错误');
    }

    $translated_text = trim($result['choices'][0]['message']['content']);
    error_log("Translation success: {$source_lang} -> {$target_lang} [{$content_type}]: " . substr($translated_text, 0, 50) . "...");
    
    return $translated_text;
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
    try {
        $cache_dir = dirname(__DIR__) . '/cache/translations/';
        if (!is_dir($cache_dir)) {
            if (!mkdir($cache_dir, 0755, true)) {
                throw new Exception("无法创建缓存目录");
            }
        }

        $cache_key = md5($source_lang . '|' . $target_lang . '|' . $text);
        $cache_file = $cache_dir . $cache_key . '.cache';

        if (file_put_contents($cache_file, $translation) === false) {
            throw new Exception("无法写入缓存文件");
        }
    } catch (Exception $e) {
        // 缓存失败不影响主要功能，只记录日志
        error_log("Cache write failed: " . $e->getMessage());
    }
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
                // 生成slug
                $slug = strtolower(preg_replace('/[^a-zA-Z0-9]+/', '-', trim($text)));
                $slug = trim($slug, '-');
                
                $stmt = $conn->prepare("
                    INSERT INTO product_i18n (product_id, locale, name, slug, status, translation_timestamp) 
                    VALUES (?, ?, ?, ?, 'published', CURRENT_TIMESTAMP)
                    ON DUPLICATE KEY UPDATE 
                    name = VALUES(name), 
                    slug = VALUES(slug),
                    translation_timestamp = CURRENT_TIMESTAMP
                ");
                if ($stmt) {
                    $stmt->bind_param('isss', $product_id, $normalized_locale, $text, $slug);
                    if (!$stmt->execute()) {
                        error_log("Failed to save name translation: " . $stmt->error);
                    }
                    $stmt->close();
                }
                
            } elseif ($content_type === 'description') {
                // 先检查该product_id和locale是否已有记录
                $check_stmt = $conn->prepare("SELECT name FROM product_i18n WHERE product_id = ? AND locale = ?");
                $check_stmt->bind_param('is', $product_id, $normalized_locale);
                $check_stmt->execute();
                $existing = $check_stmt->get_result()->fetch_assoc();
                $check_stmt->close();
                
                if ($existing) {
                    // 如果记录存在，只更新description
                    $stmt = $conn->prepare("
                        UPDATE product_i18n 
                        SET description = ?, translation_timestamp = CURRENT_TIMESTAMP 
                        WHERE product_id = ? AND locale = ?
                    ");
                    $stmt->bind_param('sis', $text, $product_id, $normalized_locale);
                } else {
                    // 如果记录不存在，需要提供name字段的默认值
                    $default_name = ''; // 空字符串作为默认值
                    $default_slug = 'product-' . $product_id . '-' . strtolower(substr($normalized_locale, 0, 2));
                    
                    $stmt = $conn->prepare("
                        INSERT INTO product_i18n (product_id, locale, name, description, slug, status, translation_timestamp) 
                        VALUES (?, ?, ?, ?, ?, 'published', CURRENT_TIMESTAMP)
                    ");
                    $stmt->bind_param('issss', $product_id, $normalized_locale, $default_name, $text, $default_slug);
                }
                
                if ($stmt) {
                    if (!$stmt->execute()) {
                        error_log("Failed to save description translation: " . $stmt->error);
                    }
                    $stmt->close();
                }
                
            }
        }
    }
}
?>
