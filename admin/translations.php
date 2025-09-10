<?php
// admin/translations.php - 翻译管理界面

require_once '../api/config.php';
require_once '../api/utils.php';
require_auth();

// 获取当前语言参数
$current_lang = $_GET['lang'] ?? 'en';

// 处理表单提交
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';

    switch ($action) {
        case 'update_translation':
            $content_key = $_POST['content_key'];
            $language_code = $_POST['language_code'];
            $translated_text = $_POST['translated_text'];

            // 更新或插入翻译
            $conn = get_db_connection();

            // 确保content_key存在
            $stmt = $conn->prepare("INSERT IGNORE INTO site_content (content_key) VALUES (?)");
            $stmt->bind_param("s", $content_key);
            $stmt->execute();

            // 更新翻译
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
            break;

        case 'clear_cache':
            // 清空缓存
            require_once '../api/language.php';
            clear_cache();
            $message = "缓存已清空";
            break;

        case 'export_json':
            $language_code = $_POST['export_lang'];
            $translations = get_all_translations($language_code);

            header('Content-Type: application/json');
            header('Content-Disposition: attachment; filename="translations_' . $language_code . '.json"');
            echo json_encode($translations, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
            exit;
    }
}

// 获取可用语言
$available_languages = get_available_languages();

// 获取当前语言的翻译
$current_translations = get_all_translations($current_lang);

// 获取所有内容键
$conn = get_db_connection();
$result = $conn->query("SELECT content_key FROM site_content ORDER BY content_key");
$content_keys = [];
while ($row = $result->fetch_assoc()) {
    $content_keys[] = $row['content_key'];
}

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
    <div class="admin-container">
        <header class="admin-header">
            <h1>Translation Management</h1>
            <nav class="admin-nav">
                <a href="dashboard.php">← Back to Dashboard</a>
            </nav>
        </header>

        <main class="admin-main">
            <?php if (isset($message)): ?>
                <div class="status-message status-success">
                    <?php echo htmlspecialchars($message); ?>
                </div>
            <?php endif; ?>

            <!-- 语言切换标签 -->
            <div class="language-tabs">
                <?php foreach ($available_languages as $lang): ?>
                    <a href="?lang=<?php echo $lang['language_code']; ?>"
                       class="language-tab <?php echo $current_lang === $lang['language_code'] ? 'active' : ''; ?>">
                        <?php echo htmlspecialchars($lang['language_name_native']); ?>
                        (<?php echo htmlspecialchars($lang['language_code']); ?>)
                    </a>
                <?php endforeach; ?>
            </div>

            <!-- 批量操作 -->
            <div class="translation-form">
                <h3>批量操作</h3>
                <div class="action-buttons">
                    <form method="post" style="display: inline;">
                        <input type="hidden" name="action" value="clear_cache">
                        <button type="submit" class="btn btn-secondary" onclick="return confirm('确定要清空缓存吗？')">清空缓存</button>
                    </form>

                    <form method="post" style="display: inline;">
                        <input type="hidden" name="action" value="export_json">
                        <input type="hidden" name="export_lang" value="<?php echo $current_lang; ?>">
                        <button type="submit" class="btn btn-success">导出 JSON</button>
                    </form>
                </div>
            </div>

            <!-- 翻译编辑表单 -->
            <form method="post" class="translation-form">
                <input type="hidden" name="action" value="update_translation">
                <input type="hidden" name="language_code" value="<?php echo $current_lang; ?>">

                <h3>编辑翻译 (<?php echo $current_lang; ?>)</h3>

                <?php foreach ($content_keys as $key): ?>
                    <div class="translation-item">
                        <div class="translation-key"><?php echo htmlspecialchars($key); ?></div>
                        <input type="hidden" name="content_keys[]" value="<?php echo htmlspecialchars($key); ?>">
                        <textarea
                            name="translations[<?php echo htmlspecialchars($key); ?>]"
                            class="translation-text"
                            placeholder="输入翻译内容..."
                        ><?php echo htmlspecialchars($current_translations[$key] ?? ''); ?></textarea>
                    </div>
                <?php endforeach; ?>

                <div class="action-buttons">
                    <button type="submit" class="btn btn-primary">保存所有翻译</button>
                    <a href="translations.php?lang=<?php echo $current_lang; ?>" class="btn btn-secondary">取消</a>
                </div>
            </form>

            <!-- 静态翻译文件状态 -->
            <div class="translation-form">
                <h3>静态翻译文件状态</h3>
                <p>Static translation files are located in the <code>client/src/assets/locales/</code> directory.</p>
                <ul>
                    <li>English translation file: <code>en.json</code> - <?php echo file_exists('../client/src/assets/locales/en.json') ? 'Exists' : 'Not found'; ?></li>
                    <li>French translation file: <code>fr.json</code> - <?php echo file_exists('../client/src/assets/locales/fr.json') ? 'Exists' : 'Not found'; ?></li>
                    <li>German translation file: <code>de.json</code> - <?php echo file_exists('../client/src/assets/locales/de.json') ? 'Exists' : 'Not found'; ?></li>
                    <li>Italian translation file: <code>it.json</code> - <?php echo file_exists('../client/src/assets/locales/it.json') ? 'Exists' : 'Not found'; ?></li>
                    <li>Spanish translation file: <code>es.json</code> - <?php echo file_exists('../client/src/assets/locales/es.json') ? 'Exists' : 'Not found'; ?></li>
                </ul>
                <p><strong>Note:</strong> UI text uses static translation files first, dynamic content (such as product information) uses database translations.</p>
            </div>
        </main>
    </div>

    <script>
        // 表单提交确认
        document.querySelector('form').addEventListener('submit', function(e) {
            if (!confirm('确定要保存所有翻译吗？')) {
                e.preventDefault();
            }
        });

        // 自动保存草稿（可选功能）
        let autoSaveTimer;
        document.addEventListener('input', function(e) {
            if (e.target.classList.contains('translation-text')) {
                clearTimeout(autoSaveTimer);
                autoSaveTimer = setTimeout(() => {
                    // 这里可以实现自动保存功能
                    console.log('Translation changed:', e.target.name);
                }, 2000);
            }
        });
    </script>
</body>
</html>
