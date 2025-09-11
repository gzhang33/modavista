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
    <script>
        // 会话检查现在由SessionManager处理
        // 移除了硬编码的会话检查，改为动态管理
    </script>
    <div class="dashboard-container">
        <!-- 管理导航栏 -->
        <nav class="admin-nav-bar">
            <div class="nav-container">
                <div class="nav-brand">
                    <h3><i class="fas fa-cogs"></i> DreaModa 管理后台</h3>
                </div>
                <ul class="nav-links">
                    <li><a href="dashboard.php" class="nav-link active"><i class="fas fa-box"></i> 产品管理</a></li>
                    <li><a href="translations.php" class="nav-link"><i class="fas fa-language"></i> 多语言翻译</a></li>
                    <li><a href="../api/logout.php" class="nav-link logout"><i class="fas fa-sign-out-alt"></i> 退出登录</a></li>
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
                    <!-- Filter buttons will be dynamically inserted here -->
                    <div class="filter-bar-actions">
                        <div class="filter-search">
                            <i class="fas fa-search search-icon"></i>
                            <input type="text" id="search-products" placeholder="搜索产品..." />
                        </div>
                        <button id="clear-filters-btn" class="btn btn-secondary btn-sm">清除筛选</button>
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
                                <th>分类</th>
                                <th>描述</th>
                                <th>创建日期</th>
                                <th class="sticky-right">操作</th>
                            </tr>
                        </thead>
                        <tbody id="products-table-body">
                            <!-- Product rows will be injected by JS -->
                        </tbody>
                    </table>
                </div>
            </section>
        </main>
    </div>
    


<!-- Toast Notification -->
<div id="toast-notification" class="toast"></div>

    <script type="module" src="assets/js/main.js?v=3"></script>
</body>
</html>
