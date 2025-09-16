<?php
// admin/translations.php - 翻译管理界面

require_once '../config/app.php';
require_once '../api/utils.php';
require_once '../api/language.php';
require_auth();

// 获取当前语言参数
$current_lang = $_GET['lang'] ?? 'en';
// 规范化语言代码（如 en -> en-GB）
$current_lang = normalize_language_code($current_lang);

// 处理表单提交
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';

    switch ($action) {
        case 'update_translation':
            $language_code = $_POST["language_code"] ?? $current_lang;

            // 批量保存：优先处理 translations[]
            if (isset($_POST['translations']) && is_array($_POST['translations'])) {
                $conn = get_db_connection();
                // 事务化批量保存
                $conn->begin_transaction();

                // 预创建语句，避免重复准备
                $stmt_insert_key = $conn->prepare("INSERT IGNORE INTO site_content (content_key) VALUES (?)");
                $stmt_upsert = $conn->prepare("
                    INSERT INTO site_content_translation (content_id, language_code, translated_text)
                    SELECT sc.id, ?, ?
                    FROM site_content sc
                    WHERE sc.content_key = ?
                    ON DUPLICATE KEY UPDATE translated_text = ?
                ");
                // 查询当前值用于乐观锁与增量更新
                $stmt_current = $conn->prepare("
                    SELECT sct.translated_text
                    FROM site_content sc
                    LEFT JOIN site_content_translation sct ON sc.id = sct.content_id AND sct.language_code = ?
                    WHERE sc.content_key = ?
                ");

                $conflicts = [];
                $updated_keys = [];
                foreach ($_POST['translations'] as $content_key => $translated_text) {
                    // 跳过全空白内容但保留显式清空的可能（此处仍允许空字符串保存）
                    $key = trim((string)$content_key);
                    if ($key === '') { continue; }

                    // 确保 content_key 存在
                    $stmt_insert_key->bind_param("s", $key);
                    $stmt_insert_key->execute();

                    // 乐观锁：比较 original_hash 与当前库值
                    $original_hash = $_POST['original_hash'][$key] ?? null;
                    $stmt_current->bind_param("ss", $language_code, $key);
                    $stmt_current->execute();
                    $res = $stmt_current->get_result();
                    $row = $res->fetch_assoc();
                    $current_value = $row['translated_text'] ?? '';
                    $current_hash = sha1((string)$current_value);

                    if ($original_hash !== null && $original_hash !== $current_hash) {
                        // 冲突：优先以数据库为准 -> 跳过更新
                        $conflicts[] = $key;
                        continue;
                    }

                    // 增量保存：若值无变化则跳过
                    if ((string)$translated_text === (string)$current_value) {
                        continue;
                    }

                    // 内容校验与清洗：长度限制与HTML白名单（默认不允许HTML）
                    $max_len = 4000;
                    $allowed_tags = '';
                    $clean_text = strip_tags((string)$translated_text, $allowed_tags);
                    if (mb_strlen($clean_text) > $max_len) {
                        $clean_text = mb_substr($clean_text, 0, $max_len);
                    }

                    // 写入或更新翻译
                    $stmt_upsert->bind_param("ssss", $language_code, $clean_text, $key, $clean_text);
                    $stmt_upsert->execute();
                    $updated_keys[] = $key;

                    // 精准清理缓存：仅清理当前键
                    $cache_key = get_cache_key('translation', $language_code, $key);
                    clear_cache($cache_key);
                }

                $stmt_insert_key->close();
                $stmt_upsert->close();
                $stmt_current->close();

                // 提交事务
                $conn->commit();

                if (!empty($conflicts)) {
                    $message = "已保存部分翻译；存在冲突（已按数据库为准跳过）：" . htmlspecialchars(implode(', ', $conflicts));
                } else {
                    $message = "批量翻译已保存";
                }

                // 自动同步当前语言
                if (!empty($updated_keys)) {
                    // 以数据库为准覆盖写入前端
                    $translations_for_sync = get_all_translations($language_code);
                    $base_dir_public = realpath(__DIR__ . '/../client/public/locales');
                    $base_dir_src = realpath(__DIR__ . '/../client/src/assets/locales');
                    $file_locale = $language_code . '.json';
                    $file_lang = strtolower(substr($language_code, 0, 2)) . '.json';
                    $json_sync = json_encode($translations_for_sync, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
                    foreach ([$base_dir_public, $base_dir_src] as $dir) {
                        if ($dir && is_dir($dir) && is_writable($dir)) {
                            @file_put_contents($dir . DIRECTORY_SEPARATOR . $file_locale, $json_sync);
                            @file_put_contents($dir . DIRECTORY_SEPARATOR . $file_lang, $json_sync);
                        }
                    }
                }
                break;
            }

            // 兼容单条更新（旧表单）
            $content_key = $_POST['content_key'] ?? '';
            $translated_text = $_POST['translated_text'] ?? '';
            if ($content_key !== '') {
                $conn = get_db_connection();
                $stmt = $conn->prepare("INSERT IGNORE INTO site_content (content_key) VALUES (?)");
                $stmt->bind_param("s", $content_key);
                $stmt->execute();
                $stmt = $conn->prepare("
                    INSERT INTO site_content_translation (content_id, language_code, translated_text)
                    SELECT sc.id, ?, ?
                    FROM site_content sc
                    WHERE sc.content_key = ?
                    ON DUPLICATE KEY UPDATE translated_text = ?
                ");
                $stmt->bind_param("ssss", $language_code, $translated_text, $content_key, $translated_text);
                $stmt->execute();
                $message = "翻译已更新";
            }
            break;

        case 'clear_cache':
            // 清空缓存
            require_once '../api/language.php';
            clear_cache();
            $message = "缓存已清空";
            break;

        case 'sync_frontend':
            // 将数据库翻译同步到前端 JSON 文件
            $language_code = $_POST['language_code'] ?? $current_lang;
            $language_code = normalize_language_code($language_code);
            $resolution = $_POST['resolution'] ?? 'overwrite'; // overwrite | keep_newer

            $translations = get_all_translations($language_code);

            // 目标目录
            $base_dir_public = realpath(__DIR__ . '/../client/public/locales');
            $base_dir_src = realpath(__DIR__ . '/../client/src/assets/locales');

            // 文件名：locale 与 lang 回退
            $file_locale = $language_code . '.json';
            $file_lang = strtolower(substr($language_code, 0, 2)) . '.json';
            $written_paths = [];

            $json = json_encode($translations, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

            $targets = [];
            if ($base_dir_public && is_dir($base_dir_public) && is_writable($base_dir_public)) {
                $targets[] = $base_dir_public . DIRECTORY_SEPARATOR . $file_locale;
                $targets[] = $base_dir_public . DIRECTORY_SEPARATOR . $file_lang;
            }
            if ($base_dir_src && is_dir($base_dir_src) && is_writable($base_dir_src)) {
                $targets[] = $base_dir_src . DIRECTORY_SEPARATOR . $file_locale;
                $targets[] = $base_dir_src . DIRECTORY_SEPARATOR . $file_lang;
            }

            // 冲突检测
            $conflict_detected = false;
            if ($base_dir_public && $base_dir_src) {
                foreach ([$file_locale, $file_lang] as $fname) {
                    $p = $base_dir_public . DIRECTORY_SEPARATOR . $fname;
                    $s = $base_dir_src . DIRECTORY_SEPARATOR . $fname;
                    if (file_exists($p) && file_exists($s)) {
                        $hp = sha1((string)@file_get_contents($p));
                        $hs = sha1((string)@file_get_contents($s));
                        if ($hp !== $hs) { $conflict_detected = true; break; }
                    }
                }
            }

            if ($conflict_detected && $resolution === 'keep_newer') {
                foreach ([$file_locale, $file_lang] as $fname) {
                    $p = $base_dir_public ? ($base_dir_public . DIRECTORY_SEPARATOR . $fname) : null;
                    $s = $base_dir_src ? ($base_dir_src . DIRECTORY_SEPARATOR . $fname) : null;
                    if ($p && $s && file_exists($p) && file_exists($s)) {
                        $mp = @filemtime($p) ?: 0;
                        $ms = @filemtime($s) ?: 0;
                        $keep = ($mp >= $ms) ? $p : $s;
                        $json_to_write = @file_get_contents($keep);
                        $target = ($keep === $p) ? $s : $p;
                        if ($json_to_write !== false && is_writable(dirname($target))) {
                            @file_put_contents($target, $json_to_write);
                            $written_paths[] = $target;
                        }
                    }
                }
            } else {
                foreach ($targets as $t) {
                    if (is_writable(dirname($t))) {
                        @file_put_contents($t, $json);
                        $written_paths[] = $t;
                    }
                }
            }

            // 清空该语言的翻译缓存
            require_once '../api/language.php';
            clear_cache('translation_' . $language_code . '*');

            $message = '前端翻译文件已同步：' . implode(', ', array_map('htmlspecialchars', $written_paths));
            break;

        case 'sync_all_frontend':
            $langs = get_available_languages();
            $written = [];
            foreach ($langs as $lg) {
                $lc = $lg['language_code'];
                $translations = get_all_translations($lc);
                $base_dir_public = realpath(__DIR__ . '/../client/public/locales');
                $base_dir_src = realpath(__DIR__ . '/../client/src/assets/locales');
                $file_locale = $lc . '.json';
                $file_lang = strtolower(substr($lc, 0, 2)) . '.json';
                $json = json_encode($translations, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
                if ($base_dir_public && is_dir($base_dir_public) && is_writable($base_dir_public)) {
                    file_put_contents($base_dir_public . DIRECTORY_SEPARATOR . $file_locale, $json);
                    file_put_contents($base_dir_public . DIRECTORY_SEPARATOR . $file_lang, $json);
                }
                if ($base_dir_src && is_dir($base_dir_src) && is_writable($base_dir_src)) {
                    file_put_contents($base_dir_src . DIRECTORY_SEPARATOR . $file_locale, $json);
                    file_put_contents($base_dir_src . DIRECTORY_SEPARATOR . $file_lang, $json);
                }
                // 清缓存
                clear_cache('translation_' . $lc . '*');
                $written[] = $lc;
            }
            $message = '已同步全部语言：' . htmlspecialchars(implode(', ', $written));
            break;
    }
}

// 获取可用语言
$available_languages = get_available_languages();
// 当前系统语言（展示用）
$system_current_language = get_current_language();

// 获取当前语言的翻译（稍后按需要取子集）
$all_translations = get_all_translations($current_lang);

// 搜索/筛选 + 分页与可配置条数
$conn = get_db_connection();
$allowed_page_sizes = [10, 25, 50, 100];
$page_size = isset($_GET['page_size']) ? (int)$_GET['page_size'] : 25;
if (!in_array($page_size, $allowed_page_sizes, true)) { $page_size = 25; }
$page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
$query_q = trim((string)($_GET['q'] ?? ''));
$only_empty = isset($_GET['only_empty']) && $_GET['only_empty'] === '1';

// 统计总数（考虑筛选）
$sql_count = "SELECT COUNT(*) AS c
              FROM site_content sc
              LEFT JOIN site_content_translation sct ON sc.id = sct.content_id AND sct.language_code = ?
              WHERE 1=1";
$params = [$current_lang];
$types = 's';
if ($query_q !== '') {
    $sql_count .= " AND (sc.content_key LIKE ? OR sct.translated_text LIKE ?)";
    $like = '%' . $query_q . '%';
    $params[] = $like; $params[] = $like; $types .= 'ss';
}
if ($only_empty) {
    $sql_count .= " AND (sct.translated_text IS NULL OR sct.translated_text = '')";
}
$stmt_count = $conn->prepare($sql_count);
$stmt_count->bind_param($types, ...$params);
$stmt_count->execute();
$rc = $stmt_count->get_result();
$rowc = $rc->fetch_assoc();
$total_count = (int)($rowc['c'] ?? 0);
$stmt_count->close();

$offset = ($page - 1) * $page_size;

// 拉取当前页 keys（考虑筛选）
$sql_keys = "SELECT sc.content_key
             FROM site_content sc
             LEFT JOIN site_content_translation sct ON sc.id = sct.content_id AND sct.language_code = ?
             WHERE 1=1";
$params2 = [$current_lang];
$types2 = 's';
if ($query_q !== '') {
    $sql_keys .= " AND (sc.content_key LIKE ? OR sct.translated_text LIKE ?)";
    $params2[] = $like; $params2[] = $like; $types2 .= 'ss';
}
if ($only_empty) {
    $sql_keys .= " AND (sct.translated_text IS NULL OR sct.translated_text = '')";
}
$sql_keys .= " ORDER BY sc.content_key LIMIT ? OFFSET ?";
$params2[] = $page_size; $params2[] = $offset; $types2 .= 'ii';
$stmt_keys = $conn->prepare($sql_keys);
$stmt_keys->bind_param($types2, ...$params2);
$stmt_keys->execute();
$result = $stmt_keys->get_result();
$content_keys = [];
while ($row = $result->fetch_assoc()) { $content_keys[] = $row['content_key']; }
$stmt_keys->close();

// 当前页翻译子集
$current_translations = [];
foreach ($content_keys as $k) { $current_translations[$k] = $all_translations[$k] ?? ''; }

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Translation Management - DreaModa Admin Panel</title>
    <link href="assets/css/base.css" rel="stylesheet">
    <link href="assets/css/dashboard.css" rel="stylesheet">
    <style>
        .translation-form {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-bottom: 20px;
        }

        .translation-item {
            border: 1px solid #ddd;
            border-radius: 4px;
            padding: 15px;
            margin-bottom: 10px;
            background: #f9f9f9;
        }
        .translations-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
        }
        @media (min-width: 1400px) {
            .translations-grid { grid-template-columns: repeat(4, 1fr); }
        }
        @media (max-width: 900px) {
            .translations-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 600px) {
            .translations-grid { grid-template-columns: 1fr; }
        }
        .page-size-selector {
            display: inline-flex;
            gap: 4px;
            margin-left: 8px;
        }
        .page-size-option {
            display: inline-block;
            padding: 4px 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
            text-decoration: none;
            color: #666;
            background: white;
            font-size: 14px;
        }
        .page-size-option:hover {
            background: #f5f5f5;
            color: #333;
        }
         .page-size-option.active {
             background: #007bff;
             color: white;
             border-color: #007bff;
         }
         .pagination {
             display: flex;
             align-items: center;
             justify-content: center;
             gap: 8px;
             margin: 20px 0;
         }
         .pagination-btn, .pagination-page {
             display: inline-flex;
             align-items: center;
             justify-content: center;
             width: 32px;
             height: 32px;
             border: 1px solid #ddd;
             border-radius: 50%;
             text-decoration: none;
             color: #666;
             background: white;
             font-size: 14px;
         }
         .pagination-btn:hover, .pagination-page:hover {
             background: #f5f5f5;
             color: #333;
         }
         .pagination-page.active {
             background: #007bff;
             color: white;
             border-color: #007bff;
             font-weight: bold;
             position: relative;
         }
         .pagination-page.active::after {
             content: '';
             position: absolute;
             bottom: -2px;
             left: 50%;
             transform: translateX(-50%);
             width: 12px;
             height: 2px;
             background: #007bff;
         }
         .pagination-btn.disabled {
             background: #f5f5f5;
             color: #ccc;
             cursor: not-allowed;
         }
         .pagination-btn.disabled:hover {
             background: #f5f5f5;
             color: #ccc;
         }

        .translation-key {
            font-weight: bold;
            color: #333;
            margin-bottom: 8px;
        }

        .translation-text {
            width: 100%;
            padding: 8px;
            border: 1px solid #ccc;
            border-radius: 4px;
            font-family: monospace;
            min-height: 60px;
        }

        .language-tabs {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 10px;
        }

        .language-tab {
            padding: 8px 16px;
            border: 1px solid #ddd;
            border-radius: 4px;
            background: white;
            cursor: pointer;
            text-decoration: none;
            color: #666;
        }

        .language-tab.active {
            background: #007bff;
            color: white;
            border-color: #007bff;
        }

        .action-buttons {
            display: flex;
            gap: 10px;
            margin-top: 20px;
        }

        .btn {
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
        }

        .btn-primary {
            background: #007bff;
            color: white;
        }

        .btn-secondary {
            background: #6c757d;
            color: white;
        }

        .btn-success {
            background: #28a745;
            color: white;
        }

        .status-message {
            padding: 10px;
            border-radius: 4px;
            margin-bottom: 20px;
        }

        .status-success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
    </style>
</head>
<body>
    <div class="dashboard-container">
        <!-- 管理导航栏 -->
        <nav class="admin-nav-bar">
            <div class="nav-container">
                <div class="nav-brand">
                    <h3><i class="fas fa-cogs"></i> DreaModa 管理后台</h3>
                </div>
                <ul class="nav-links">
                    <li><a href="dashboard.php" class="nav-link"><i class="fas fa-box"></i> 产品管理</a></li>
                    <li><a href="contact_messages.php" class="nav-link"><i class="fas fa-envelope"></i> 主页表单查询</a></li>
                    <li><a href="translations.php" class="nav-link active"><i class="fas fa-language"></i> 多语言翻译</a></li>
                    <li><a href="../api/logout.php" class="nav-link logout"><i class="fas fa-sign-out-alt"></i> 退出登录</a></li>
                </ul>
            </div>
        </nav>

        <main class="main-content">
            <header class="main-header">
                <h2><i class="fas fa-language"></i> 多语言翻译管理</h2>
            </header>
            <?php if (isset($message)): ?>
                <div class="status-message status-success">
                    <?php echo htmlspecialchars($message); ?>
                </div>
            <?php endif; ?>

            <!-- 语言切换标签 + 分页与条数选择 -->
            <div class="language-tabs">
                <?php foreach ($available_languages as $lang): ?>
                    <a href="?lang=<?php echo $lang['language_code']; ?>"
                       class="language-tab <?php echo $current_lang === $lang['language_code'] ? 'active' : ''; ?>">
                        <?php echo htmlspecialchars($lang['language_name_native']); ?>
                        (<?php echo htmlspecialchars($lang['language_code']); ?>)
                    </a>
                <?php endforeach; ?>
            </div>



            <!-- 搜索与筛选 -->
            <div class="translation-form" id="search-section">
                <h3>搜索与筛选</h3>
                <form method="get" id="search-form">
                    <input type="hidden" name="lang" value="<?php echo htmlspecialchars($current_lang); ?>">
                    <input type="hidden" name="page" value="1">
                    <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                        <label>搜索：</label>
                        <input type="text" name="q" value="<?php echo htmlspecialchars($query_q); ?>" placeholder="content_key 或 文本关键词">
                        <label style="margin-left:8px;">
                            <input type="checkbox" name="only_empty" value="1" <?php echo ($only_empty ? 'checked' : ''); ?> onchange="submitSearchForm()"> 仅显示未翻译
                        </label>
                        <button type="submit" class="btn btn-secondary" onclick="submitSearchForm(event)">搜索</button>
                        
                        <div style="margin-left: auto; display: flex; align-items: center; gap: 8px;">
                            <span>每页条数：</span>
                            <div class="page-size-selector">
                                <?php foreach ([10,25,50,100] as $ps): ?>
                                    <a href="?lang=<?php echo urlencode($current_lang); ?>&page=1&page_size=<?php echo $ps; ?>&q=<?php echo urlencode($query_q); ?>&only_empty=<?php echo ($only_empty ? '1' : '0'); ?>" class="page-size-option <?php echo ($ps === $page_size ? 'active' : ''); ?>" onclick="submitPageSizeChange(event, this)"><?php echo $ps; ?></a>
                                <?php endforeach; ?>
                            </div>
                            <span style="margin-left:8px;">总数：<?php echo (int)$total_count; ?>，当前第 <?php echo (int)$page; ?> / <?php echo max(1, (int)ceil($total_count / $page_size)); ?> 页</span>
                        </div>
                    </div>
                </form>
            </div>

            <!-- 翻译编辑表单（批量保存 + 乐观锁，多列布局） -->
            <form method="post" class="translation-form">
                <input type="hidden" name="action" value="update_translation">
                <input type="hidden" name="language_code" value="<?php echo $current_lang; ?>">

                <h3>编辑翻译 (<?php echo $current_lang; ?>)</h3>

                <div class="translations-grid">
                    <?php foreach ($content_keys as $key): ?>
                        <div class="translation-item">
                            <div class="translation-key"><?php echo htmlspecialchars($key); ?></div>
                            <textarea
                                name="translations[<?php echo htmlspecialchars($key); ?>]"
                                class="translation-text js-autosize"
                                placeholder="输入翻译内容..."
                                data-key="<?php echo htmlspecialchars($key); ?>"
                            ><?php echo htmlspecialchars($current_translations[$key] ?? ''); ?></textarea>
                            <input type="hidden" name="original_hash[<?php echo htmlspecialchars($key); ?>]" value="<?php echo sha1((string)($current_translations[$key] ?? '')); ?>">
                        </div>
                    <?php endforeach; ?>
                </div>

                <div class="action-buttons">
                    <button type="submit" class="btn btn-primary">保存所有翻译</button>
                    <a href="translations.php?lang=<?php echo $current_lang; ?>" class="btn btn-secondary">取消</a>
                </div>
            </form>

            <!-- 分页导航 -->
            <?php if ($total_count > $page_size): ?>
            <div class="translation-form">
                <div class="pagination">
                    <?php
                    $total_pages = max(1, (int)ceil($total_count / $page_size));
                    $prev_page = max(1, $page - 1);
                    $next_page = min($total_pages, $page + 1);
                    $base_url = "?lang=" . urlencode($current_lang) . "&page_size=" . $page_size . "&q=" . urlencode($query_q) . "&only_empty=" . ($only_empty ? '1' : '0');
                    ?>
                    
                    <!-- 上一页按钮 -->
                    <a href="<?php echo $base_url; ?>&page=<?php echo $prev_page; ?>" class="pagination-btn <?php echo ($page <= 1 ? 'disabled' : ''); ?>">
                        <span>←</span>
                    </a>
                    
                    <!-- 页码按钮 -->
                    <?php for ($i = max(1, $page - 1); $i <= min($total_pages, $page + 1); $i++): ?>
                        <a href="<?php echo $base_url; ?>&page=<?php echo $i; ?>" class="pagination-page <?php echo ($i === $page ? 'active' : ''); ?>">
                            <?php echo $i; ?>
                        </a>
                    <?php endfor; ?>
                    
                    <!-- 下一页按钮 -->
                    <a href="<?php echo $base_url; ?>&page=<?php echo $next_page; ?>" class="pagination-btn <?php echo ($page >= $total_pages ? 'disabled' : ''); ?>">
                        <span>→</span>
                    </a>
                </div>
            </div>
            <?php endif; ?>

            <!-- 静态翻译文件状态 -->
            <div class="translation-form">
                <h3>静态翻译文件状态</h3>
                <p>Static translation files are located in <code>client/public/locales/</code> (preferred) or <code>client/src/assets/locales/</code>.</p>
                <ul>
                    <?php
                        $pub = realpath(__DIR__ . '/../client/public/locales');
                        $src = realpath(__DIR__ . '/../client/src/assets/locales');
                        $exist = function($name) use ($pub, $src) {
                            $p = $pub ? file_exists($pub . DIRECTORY_SEPARATOR . $name) : false;
                            $s = $src ? file_exists($src . DIRECTORY_SEPARATOR . $name) : false;
                            if ($p && $s) return 'Exists (public & src)';
                            if ($p) return 'Exists (public)';
                            if ($s) return 'Exists (src)';
                            return 'Not found';
                        };
                    ?>
                    <li>English translation file: <code>en.json</code> - <?php echo $exist('en.json'); ?></li>
                    <li>French translation file: <code>fr.json</code> - <?php echo $exist('fr.json'); ?></li>
                    <li>German translation file: <code>de.json</code> - <?php echo $exist('de.json'); ?></li>
                    <li>Italian translation file: <code>it.json</code> - <?php echo $exist('it.json'); ?></li>
                    <li>Spanish translation file: <code>es.json</code> - <?php echo $exist('es.json'); ?></li>
                </ul>
                <p><strong>Note:</strong> UI text uses static translation files first, dynamic content (such as product information) uses database translations.</p>
            </div>
        </main>
    </div>

    <script>
        // 未保存变更提示、autosize、快捷键保存与键盘导航
        (function() {
            const form = document.querySelector('form.translation-form');
            let changed = false;
            const maxLen = 4000;

            // autosize
            function resize(el) {
                el.style.height = 'auto';
                el.style.height = (el.scrollHeight + 2) + 'px';
            }

            document.querySelectorAll('.js-autosize').forEach(el => {
                resize(el);
                el.addEventListener('input', () => { resize(el); changed = true; });
            });

            // beforeunload guard
            window.addEventListener('beforeunload', function(e) {
                if (changed) {
                    e.preventDefault();
                    e.returnValue = '';
                }
            });
            form.addEventListener('submit', function() { changed = false; });

            // Ctrl+Enter 保存
            document.addEventListener('keydown', function(e) {
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    form.submit();
                }
            });

            // 上下键在文本块间导航（Alt+↑/↓）
            const areas = Array.from(document.querySelectorAll('.js-autosize'));
            document.addEventListener('keydown', function(e) {
                if ((e.altKey) && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
                    const idx = areas.indexOf(document.activeElement);
                    if (idx !== -1) {
                        let next = e.key === 'ArrowDown' ? idx + 1 : idx - 1;
                        if (next >= 0 && next < areas.length) {
                            areas[next].focus();
                            e.preventDefault();
                        }
                    }
                }
            });
        })();

        // 搜索表单提交时保持滚动位置
        function submitSearchForm(event) {
            if (event) {
                event.preventDefault();
            }
            
            // 保存当前滚动位置
            const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
            sessionStorage.setItem('scrollPosition', scrollPosition);
            
            // 提交表单
            document.getElementById('search-form').submit();
        }

        // 页条数切换时保持滚动位置
        function submitPageSizeChange(event, element) {
            event.preventDefault();
            
            // 保存当前滚动位置
            const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
            sessionStorage.setItem('scrollPosition', scrollPosition);
            
            // 跳转到新URL
            window.location.href = element.href;
        }

        // 页面加载后恢复滚动位置
        window.addEventListener('load', function() {
            const savedScrollPosition = sessionStorage.getItem('scrollPosition');
            if (savedScrollPosition !== null) {
                // 延迟恢复滚动位置，确保页面内容已加载
                setTimeout(function() {
                    window.scrollTo(0, parseInt(savedScrollPosition));
                    sessionStorage.removeItem('scrollPosition');
                }, 100);
            }
        });
    </script>
</body>
</html>
