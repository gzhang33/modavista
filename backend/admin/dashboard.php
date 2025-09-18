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
                    <li><a href="dashboard.php" class="nav-link active"><i class="fas fa-box"></i> 产品管理</a></li>
                    <li><a href="contact_messages.php" class="nav-link"><i class="fas fa-envelope"></i> 主页表单查询</a></li>
                    <li><a href="translations.php" class="nav-link"><i class="fas fa-language"></i> 多语言翻译</a></li>
                    <li>
                        <form id="logout-form" action="../api/logout.php" method="post" style="display:inline">
                            <input type="hidden" name="csrf_token" value="<?php echo htmlspecialchars($_SESSION['csrf_token'] ?? ''); ?>">
                            <button type="submit" class="nav-link logout logout-btn"><i class="fas fa-sign-out-alt"></i> 退出登录</button>
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
                                <th><label for="select-all-checkbox" style="display: none;">Select all products</label><input type="checkbox" id="select-all-checkbox"></th>
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

    <script type="module" src="assets/js/main.js?v=7"></script>
    <script src="assets/js/components/dashboard/dashboard.js"></script>
</body>
</html>
