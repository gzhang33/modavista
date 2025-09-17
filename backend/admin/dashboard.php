<?php require_once '_auth_guard.php'; ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>展示管理后台</title>
    <link rel="stylesheet" href="assets/css/base.css">
    <link rel="stylesheet" href="assets/css/dashboard.css">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        /* Compact two-button bar for Filter and Sort */
        .filter-actions-bar {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            width: 100%;
        }
        .sort-button-container .btn {
            width: 100%;
            padding: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }

        /* Desktop layout: push sort to the far right */
        @media (min-width: 769px) {
            .filter-actions-bar { display: flex; justify-content: flex-end; }
            .sort-button-container .btn { width: auto; }
        }
        .sort-dropdown {
            position: relative;
        }
        .sort-menu {
            position: absolute;
            top: calc(100% + 8px);
            left: 0;
            background: #fff;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            box-shadow: 0 10px 15px -3px rgba(0,0,0,.1), 0 4px 6px -2px rgba(0,0,0,.05);
            min-width: 220px;
            z-index: 60;
            display: none;
        }
        .sort-menu.is-open { display: block; }
        .sort-menu button {
            display: block;
            width: 100%;
            background: transparent;
            border: 0;
            text-align: left;
            padding: 10px 12px;
            cursor: pointer;
            font-size: 14px;
        }
        .sort-menu button:hover { background: #f3f4f6; }
        /* Desktop: hide filter status panel */
        @media (min-width: 769px) {
            #filter-status-panel { display: none !important; }
            .mobile-only { display: none !important; }
        }

        /* Mobile styles - reference contact_messages.php */
        @media (max-width: 768px) {
            .filter-bar-actions { display: grid; grid-template-columns: 1fr auto; gap: 8px; align-items: center; width: 100%; }
            .mobile-only { display: inline-flex; align-items: center; gap: 6px; }
            .sort-button-container .btn { font-weight: normal; }
            .filter-button-container .btn { font-weight: normal; }
        }
    </style>
</head>
<body>
    <script>
        // 会话检查现在由SessionManager处理
        // 移除了硬编码的会话检查，改为动态管理
    </script>
    <div class="dashboard-container">
        <!-- 管理导航栏 -->
        <nav class="admin-nav-bar">
            <div class="nav-container">
                <div class="nav-brand">
                    <h3><i class="fas fa-cogs"></i> DreamModa 管理后台</h3>
                </div>
                <ul class="nav-links">
                    <li><a href="dashboard.php" class="nav-link active"><i class="fas fa-box"></i> 产品管理</a></li>
                    <li><a href="contact_messages.php" class="nav-link"><i class="fas fa-envelope"></i> 主页表单查询</a></li>
                    <li><a href="translations.php" class="nav-link"><i class="fas fa-language"></i> 多语言翻译</a></li>
                    <li>
                        <form id="logout-form" action="../api/logout.php" method="post" style="display:inline">
                            <input type="hidden" name="csrf_token" value="<?php echo htmlspecialchars($_SESSION['csrf_token'] ?? ''); ?>">
                            <button type="submit" class="nav-link logout" style="background:none;border:none;cursor:pointer"><i class="fas fa-sign-out-alt"></i> 退出登录</button>
                        </form>
                    </li>
                </ul>
            </div>
        </nav>

        <main class="main-content">
            <header class="main-header">
                <h2><i class="fas fa-box"></i> 产品展示管理</h2>
                <button id="add-product-btn" class="btn btn-primary">
                    <i class="fas fa-plus"></i> 添加新产品
                </button>
            </header>
            <section id="products-management-section" class="product-list-section">
                <div id="filter-bar" class="filter-bar">
                    <div class="filter-actions-bar filter-bar-actions">
                        <!-- 仅保留：筛选 与 排序 两个按钮 -->
                        <div class="filter-button-container">
                            <a href="filters_mobile.php" class="btn btn-secondary mobile-only">
                                <i class="fas fa-filter"></i> 筛选
                            </a>
                        </div>
                        <div class="sort-button-container sort-dropdown">
                            <button id="sort-toggle" class="btn btn-secondary">
                                <i class="fas fa-sort"></i>
                                <span id="sort-label">排序：相关性</span>
                                <i class="fas fa-chevron-down" style="font-size:12px"></i>
                            </button>
                            <div id="sort-menu" class="sort-menu" aria-hidden="true">
                                <button type="button" data-sort="relevance">相关性</button>
                                <button type="button" data-sort="newest">最新</button>
                                <button type="button" data-sort="oldest">最早</button>
                                <button type="button" data-sort="name_az">名称 A → Z</button>
                                <button type="button" data-sort="name_za">名称 Z → A</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Filter Status Display -->
                <div id="filter-status-panel" class="filter-status-panel hidden">
                    <div class="filter-status-header">
                        <span class="filter-status-title">
                            <i class="fas fa-filter"></i> 当前筛选条件
                        </span>
                        <span class="filter-status-count">0 项</span>
                    </div>
                    <div class="filter-status-content">
                        <!-- Active filter tags will be inserted here -->
                    </div>
                </div>

                <div id="bulk-actions-panel" class="bulk-actions-panel hidden">
                    <span id="selection-count">已选择 0 个项目</span>
                    <div class="bulk-actions-buttons">
                        <button id="bulk-delete-btn" class="btn btn-danger btn-sm"><i class="fas fa-trash"></i> 批量删除</button>
                    </div>
                </div>
                
                <div class="table-container">
                    <table id="products-table" class="products-table">
                        <thead>
                            <tr>
                                <th><input type="checkbox" id="select-all-checkbox"></th>
                                <th>图片</th>
                                <th>产品名</th>
                                <th>颜色</th>
                                <th>材质</th>
                                <th>季节</th>
                                <th>分类</th>
                                <!-- <th>描述</th> -->
                                <th>创建日期</th>
                                <th class="sticky-right">操作</th>
                            </tr>
                        </thead>
                        <tbody id="products-table-body">
                            <!-- Product rows will be injected by JS -->
                        </tbody>
                    </table>
                </div>
                
                <!-- Mobile product cards container -->
                <div id="products-cards" class="products-cards">
                    <!-- Product cards will be injected by JS for mobile -->
                </div>
            </section>
        </main>
    </div>
    


<!-- Toast Notification -->
<div id="toast-notification" class="toast"></div>

    <script type="module" src="assets/js/main.js?v=6"></script>
    <script>
        // 仅处理排序下拉与事件派发
        (function(){
            const section = document.querySelector('#products-management-section');
            const toggle = document.getElementById('sort-toggle');
            const menu = document.getElementById('sort-menu');
            const label = document.getElementById('sort-label');

            const MAP = {
                relevance: '排序：相关性',
                newest: '排序：最新',
                oldest: '排序：最早',
                name_az: '排序：名称 A → Z',
                name_za: '排序：名称 Z → A'
            };

            function closeMenu(){ menu && menu.classList.remove('is-open'); }

            if (toggle && menu && section) {
                toggle.addEventListener('click', (e) => {
                    e.stopPropagation();
                    menu.classList.toggle('is-open');
                });
                menu.addEventListener('click', (e) => {
                    const btn = e.target.closest('button[data-sort]');
                    if (!btn) return;
                    const sort = btn.getAttribute('data-sort');
                    label.textContent = MAP[sort] || '排序：相关性';
                    closeMenu();
                    // 向产品组件派发自定义事件
                    section.dispatchEvent(new CustomEvent('sortChanged', { detail: { criterion: sort }}));
                });
                document.addEventListener('click', (e) => {
                    if (!e.target.closest('.sort-dropdown')) closeMenu();
                });
            }
        })();
    </script>
</body>
</html>
