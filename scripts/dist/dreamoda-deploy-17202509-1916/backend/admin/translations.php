<?php require_once '_auth_guard.php';
// admin/translations.php - 产品多语言翻译管理界面

require_once '../api/utils.php';
require_once '../api/language.php';

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

                // 预创建语句，用于更新product_i18n表
                $stmt_upsert = $conn->prepare("
                    INSERT INTO product_i18n (product_id, locale, name, slug, status, translation_timestamp) 
                    VALUES (?, ?, ?, ?, 'published', CURRENT_TIMESTAMP)
                    ON DUPLICATE KEY UPDATE 
                    name = VALUES(name), 
                    slug = VALUES(slug),
                    translation_timestamp = CURRENT_TIMESTAMP
                ");
                
                // 查询当前值用于乐观锁与增量更新
                $stmt_current = $conn->prepare("
                    SELECT name, slug
                    FROM product_i18n 
                    WHERE product_id = ? AND locale = ?
                ");

                $conflicts = [];
                $updated_keys = [];
                foreach ($_POST['translations'] as $product_id => $translated_name) {
                    // 跳过全空白内容但保留显式清空的可能（此处仍允许空字符串保存）
                    $product_id = (int)$product_id;
                    if ($product_id <= 0) { continue; }

                    // 乐观锁：比较 original_hash 与当前库值
                    $original_hash = $_POST['original_hash'][$product_id] ?? null;
                    $stmt_current->bind_param("is", $product_id, $language_code);
                    $stmt_current->execute();
                    $res = $stmt_current->get_result();
                    $row = $res->fetch_assoc();
                    $current_value = $row['name'] ?? '';
                    $current_hash = sha1((string)$current_value);

                    if ($original_hash !== null && $original_hash !== $current_hash) {
                        // 冲突：优先以数据库为准 -> 跳过更新
                        $conflicts[] = $product_id;
                        continue;
                    }

                    // 增量保存：若值无变化则跳过
                    if ((string)$translated_name === (string)$current_value) {
                        continue;
                    }

                    // 内容校验与清洗：长度限制与HTML白名单（默认不允许HTML）
                    $max_len = 255;
                    $allowed_tags = '';
                    $clean_text = strip_tags((string)$translated_name, $allowed_tags);
                    if (mb_strlen($clean_text) > $max_len) {
                        $clean_text = mb_substr($clean_text, 0, $max_len);
                    }

                    // 生成slug
                    $slug = strtolower(preg_replace('/[^a-zA-Z0-9]+/', '-', trim($clean_text)));
                    $slug = trim($slug, '-');

                    // 写入或更新翻译
                    $stmt_upsert->bind_param("issss", $product_id, $language_code, $clean_text, $slug);
                    $stmt_upsert->execute();
                    $updated_keys[] = $product_id;
                }

                $stmt_upsert->close();
                $stmt_current->close();

                // 提交事务
                $conn->commit();

                if (!empty($conflicts)) {
                    $message = "已保存部分翻译；存在冲突（已按数据库为准跳过）：" . htmlspecialchars(implode(', ', $conflicts));
                } else {
                    $message = "批量翻译已保存";
                }
                break;
            }
            break;

        case 'clear_cache':
            // 清空缓存
            require_once '../api/language.php';
            clear_cache();
            $message = "缓存已清空";
            break;
    }
}

// 获取可用语言
$available_languages = get_available_languages();
// 当前系统语言（展示用）
$system_current_language = get_current_language();

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
              FROM product p
              LEFT JOIN product_i18n pi ON p.id = pi.product_id AND pi.locale = ?
              WHERE 1=1";
$params = [$current_lang];
$types = 's';
if ($query_q !== '') {
    $sql_count .= " AND (p.base_name LIKE ? OR pi.name LIKE ?)";
    $like = '%' . $query_q . '%';
    $params[] = $like; $params[] = $like; $types .= 'ss';
}
if ($only_empty) {
    $sql_count .= " AND (pi.name IS NULL OR pi.name = '')";
}
$stmt_count = $conn->prepare($sql_count);
$stmt_count->bind_param($types, ...$params);
$stmt_count->execute();
$rc = $stmt_count->get_result();
$rowc = $rc->fetch_assoc();
$total_count = (int)($rowc['c'] ?? 0);
$stmt_count->close();

$offset = ($page - 1) * $page_size;

// 拉取当前页产品（考虑筛选）
$sql_products = "SELECT 
                    p.id AS product_id,
                    p.base_name,
                    pi.name AS translated_name
                 FROM product p
                 LEFT JOIN product_i18n pi ON p.id = pi.product_id AND pi.locale = ?
                 WHERE 1=1";
$params2 = [$current_lang];
$types2 = 's';
if ($query_q !== '') {
    $sql_products .= " AND (p.base_name LIKE ? OR pi.name LIKE ?)";
    $params2[] = $like; $params2[] = $like; $types2 .= 'ss';
}
if ($only_empty) {
    $sql_products .= " AND (pi.name IS NULL OR pi.name = '')";
}
$sql_products .= " ORDER BY p.id LIMIT ? OFFSET ?";
$params2[] = $page_size; $params2[] = $offset; $types2 .= 'ii';
$stmt_products = $conn->prepare($sql_products);
$stmt_products->bind_param($types2, ...$params2);
$stmt_products->execute();
$result = $stmt_products->get_result();
$products = [];
while ($row = $result->fetch_assoc()) { 
    $products[] = [
        'product_id' => (int)$row['product_id'],
        'base_name' => $row['base_name'],
        'translated_name' => $row['translated_name'] ?? ''
    ];
}
$stmt_products->close();

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Product Translation Management - DreamModa Admin Panel</title>
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

        /* Mobile-only optimizations for this page */
        @media (max-width: 768px) {
            /* Make language tabs horizontally scrollable to avoid wrap/overflow */
            .language-tabs { display: none; }
            .language-tab {
                display: inline-flex;
                padding: 8px 12px;
                font-size: 14px;
            }

            /* Search row stacks and inputs become full-width for easier tap */
            #search-section .search-controls-row {
                display: flex;
                flex-direction: column;
                align-items: stretch;
                gap: 8px !important;
            }
            #search-section input[type="text"] {
                width: 100%;
                max-width: 100%;
                font-size: 16px; /* prevent iOS zoom */
            }
            #search-section label {
                display: flex;
                align-items: center;
                gap: 6px;
            }
            #search-section .page-size-selector {
                justify-content: flex-start;
                flex-wrap: wrap;
            }
            #search-section .page-size-option {
                padding: 6px 10px;
                font-size: 14px;
            }
            #search-section .btn {
                width: 100%;
            }

            /* Grid already collapses; ensure items have enough internal spacing */
            .translation-item {
                padding: 12px;
                min-width: 0; /* allow children to shrink within grid */
            }
            .translation-text {
                min-height: 72px;
                font-size: 16px; /* better readability + avoid zoom */
                line-height: 1.4;
                box-sizing: border-box;
                max-width: 100%;
                width: 100%;
                max-height: 200px; /* prevent a single field from overgrowing */
                overflow: auto;
            }
            .translation-key { word-break: break-all; overflow-wrap: anywhere; }

            /* Action buttons stack for easier tapping */
            .action-buttons {
                flex-direction: column;
            }
            .action-buttons .btn {
                width: 100%;
            }

            /* Pagination: larger tap targets and wrap-safe */
            .pagination {
                flex-wrap: wrap;
                gap: 10px;
            }
            .pagination-btn, .pagination-page {
                width: 40px;
                height: 40px;
                font-size: 16px;
            }
            /* Two-column edit grid on small screens */
            .translations-grid {
                grid-template-columns: repeat(2, 1fr) !important;
                max-height: calc(100vh - 300px); /* keep within viewport */
                overflow: auto;
                -webkit-overflow-scrolling: touch;
            }
        }

        /* Visibility helpers */
        .mobile-only { display: none; }
        .desktop-only { display: block; }
        @media (max-width: 768px) {
            .mobile-only { display: block; }
            .desktop-only { display: none !important; }
        }
    </style>
</head>
<body>
    <div class="dashboard-container">
        <!-- 管理导航栏 -->
        <nav class="admin-nav-bar">
            <div class="nav-container">
                <div class="nav-brand">
                    <h3><i class="fas fa-cogs"></i> DreamModa 管理后台</h3>
                </div>
                <ul class="nav-links">
                    <li><a href="dashboard.php" class="nav-link"><i class="fas fa-box"></i> 产品管理</a></li>
                    <li><a href="contact_messages.php" class="nav-link"><i class="fas fa-envelope"></i> 表单查询</a></li>
                    <li><a href="translations.php" class="nav-link active"><i class="fas fa-language"></i> 产品翻译</a></li>
                    <li><a href="../api/logout.php" class="nav-link logout"><i class="fas fa-sign-out-alt"></i> 退出登录</a></li>
                </ul>
            </div>
        </nav>

        <main class="main-content">
            <header class="main-header">
                <h2><i class="fas fa-language"></i> 产品多语言翻译管理</h2>
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

            <!-- Mobile language selector -->
            <div class="mobile-only" style="margin: 10px 0 20px 0;">
                <label for="mobile-lang-select" style="display:block; margin-bottom:6px; color:#666;">选择语言：</label>
                <select id="mobile-lang-select" style="width:100%; padding:8px 10px; border:1px solid #ddd; border-radius:4px; font-size:16px;" onchange="onMobileLangChange(this.value)">
                    <?php foreach ($available_languages as $lang): ?>
                        <option value="<?php echo htmlspecialchars($lang['language_code']); ?>" <?php echo ($current_lang === $lang['language_code']) ? 'selected' : ''; ?>>
                            <?php echo htmlspecialchars($lang['language_name_native']); ?> (<?php echo htmlspecialchars($lang['language_code']); ?>)
                        </option>
                    <?php endforeach; ?>
                </select>
            </div>



            <!-- 搜索与筛选 -->
            <div class="translation-form" id="search-section">
                <h3>搜索与筛选</h3>
                <form method="get" id="search-form">
                    <input type="hidden" name="lang" value="<?php echo htmlspecialchars($current_lang); ?>">
                    <input type="hidden" name="page" value="1">
                    <div class="search-controls-row" style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                        <label>搜索：</label>
                        <input type="text" name="q" value="<?php echo htmlspecialchars($query_q); ?>" placeholder="产品基础名称或翻译名称">
                        <label style="margin-left:8px;">
                            <input type="checkbox" name="only_empty" value="1" <?php echo ($only_empty ? 'checked' : ''); ?> onchange="submitSearchForm()"> 仅显示未翻译
                        </label>
                        <button type="submit" class="btn btn-secondary desktop-only" onclick="submitSearchForm(event)">搜索</button>
                        
                        <div id="desktop-page-controls" class="desktop-only" style="margin-left: auto; display: flex; align-items: center; gap: 8px;">
                            <span>每页条数：</span>
                            <div class="page-size-selector">
                                <?php foreach ([10,25,50,100] as $ps): ?>
                                    <a href="?lang=<?php echo urlencode($current_lang); ?>&page=1&page_size=<?php echo $ps; ?>&q=<?php echo urlencode($query_q); ?>&only_empty=<?php echo ($only_empty ? '1' : '0'); ?>" class="page-size-option <?php echo ($ps === $page_size ? 'active' : ''); ?>" onclick="submitPageSizeChange(event, this)"><?php echo $ps; ?></a>
                                <?php endforeach; ?>
                            </div>
                            <span class="desktop-only" style="margin-left:8px;">总数：<?php echo (int)$total_count; ?>，当前第 <?php echo (int)$page; ?> / <?php echo max(1, (int)ceil($total_count / $page_size)); ?> 页</span>
                        </div>
                        <!-- Mobile search button only -->
                        <div class="mobile-only" style="width:100%; display:flex;">
                            <button type="submit" class="btn btn-secondary" style="flex:1;">搜索</button>
                        </div>
                    </div>
                </form>
            </div>

            <!-- 翻译编辑表单（批量保存 + 乐观锁，多列布局） -->
            <form method="post" class="translation-form">
                <input type="hidden" name="action" value="update_translation">
                <input type="hidden" name="language_code" value="<?php echo $current_lang; ?>">

                <h3>编辑产品翻译 (<?php echo $current_lang; ?>)</h3>

                <div class="translations-grid">
                    <?php foreach ($products as $product): ?>
                        <div class="translation-item">
                            <div class="translation-key">
                                ID: <?php echo $product['product_id']; ?> - 
                                基础名称: <?php echo htmlspecialchars($product['base_name']); ?>
                            </div>
                            <textarea
                                name="translations[<?php echo $product['product_id']; ?>]"
                                class="translation-text js-autosize"
                                placeholder="输入翻译内容..."
                                data-key="<?php echo $product['product_id']; ?>"
                            ><?php echo htmlspecialchars($product['translated_name']); ?></textarea>
                            <input type="hidden" name="original_hash[<?php echo $product['product_id']; ?>]" value="<?php echo sha1((string)($product['translated_name'])); ?>">
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

        // Mobile: language change handler
        function onMobileLangChange(lang) {
            const url = new URL(window.location.href);
            url.searchParams.set('lang', lang);
            url.searchParams.set('page', '1');
            window.location.href = url.toString();
        }

        // Force page_size=10 on mobile by normalizing URL before submit/load
        function ensureMobilePageSize() {
            const isMobile = window.matchMedia && window.matchMedia('(max-width: 768px)').matches;
            if (!isMobile) return;
            // Hide any desktop-only controls that might still render
            const pcControls = document.getElementById('desktop-page-controls');
            if (pcControls) { pcControls.style.display = 'none'; }
            const url = new URL(window.location.href);
            if (url.searchParams.get('page_size') !== '10') {
                url.searchParams.set('page_size', '10');
                // keep current page but clamp to 1 for safety
                url.searchParams.set('page', '1');
                window.location.replace(url.toString());
            }
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

        // 页面加载后恢复滚动位置 + 规范化移动端页条数
        window.addEventListener('load', function() {
            ensureMobilePageSize();
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