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
            <section id="products-management-section">
                <header class="main-header">
                    <h2><i class="fas fa-box"></i> 产品展示管理</h2>
                    <button id="add-product-btn" class="btn btn-primary">
                        <i class="fas fa-plus"></i> 添加新产品
                    </button>
                </header>
                
                <!-- 添加/编辑表单已迁移至 add_product.php 独立页面 -->

                <!-- Product List Section -->
                <section id="filters-section" class="product-list-section">
                    <div class="section-header">
                        <h3 class="section-title">所有展示产品</h3>
                        <div class="filter-controls">
                            <input type="text" id="search-products" placeholder="搜索产品名称..." class="search-input">
                            <select id="filter-category" class="filter-select">
                                <option value="">所有分类</option>
                            </select>
                            <button id="advanced-filter-btn" class="btn btn-secondary btn-sm"><i class="fas fa-filter"></i> 高级筛选</button>
                            <button id="clear-filters" class="btn btn-secondary btn-sm">清除筛选</button>
                        </div>
                    </div>

                    <div id="bulk-actions-panel" class="bulk-actions-panel hidden">
                        <span id="selection-count">已选择 0 个项目</span>
                        <div class="bulk-actions-buttons">
                            <button id="bulk-delete-btn" class="btn btn-danger btn-sm"><i class="fas fa-trash"></i> 批量删除</button>
                        </div>
                    </div>

                    <!-- Advanced Filter Section (Initially Hidden) -->
                    <div id="advanced-filter-section" class="advanced-filter-section hidden">
                        <div class="filter-builder">
                            <div class="filter-logic">
                                <span>筛选逻辑:</span>
                                <select id="filter-logic-operator" class="filter-select-sm">
                                    <option value="AND" selected>AND (所有条件都满足)</option>
                                    <option value="OR">OR (任何一个条件满足)</option>
                                </select>
                            </div>
                            <div id="filter-conditions-container">
                                <!-- Filter condition rows will be added here -->
                            </div>
                            <div class="filter-actions">
                                <button id="add-filter-condition" class="btn btn-primary btn-sm"><i class="fas fa-plus"></i> 添加条件</button>
                                <button id="apply-advanced-filters" class="btn btn-success btn-sm"><i class="fas fa-check"></i> 应用筛选</button>
                            </div>
                        </div>
                        <div class="saved-filters">
                            <select id="saved-filters-select" class="filter-select-sm">
                                <option value="">加载已保存的筛选</option>
                            </select>
                            <button id="load-filter-btn" class="btn btn-secondary btn-sm"><i class="fas fa-upload"></i> 加载</button>
                            <input type="text" id="save-filter-name" placeholder="输入筛选名称..." class="search-input-sm">
                            <button id="save-filter-btn" class="btn btn-secondary btn-sm"><i class="fas fa-save"></i> 保存</button>
                            <button id="delete-filter-btn" class="btn btn-danger btn-sm"><i class="fas fa-trash"></i> 删除</button>
                        </div>
                    </div>
                    
                    <div class="table-container">
                        <table id="products-table" class="products-table">
                            <thead>
                                <tr>
                                    <th><input type="checkbox" id="select-all-checkbox"></th>
                                    <th>Immagine</th>
                                    <th>Nome Prodotto</th>
                                    <th>Colore</th>
                                    <th>Materiale</th>
                                    <th>Categoria</th>
                                    <th>Descrizione</th>
                                    <th>Data Creazione</th>
                                    <th class="sticky-right">Operazioni</th>
                                </tr>
                            </thead>
                            <tbody id="products-table-body">
                                <!-- Product rows will be injected by JS -->
                            </tbody>
                        </table>
                    </div>
                </section>
            </section>
        </main>
    </div>
    


<!-- Toast Notification -->
<div id="toast-notification" class="toast"></div>

    <script type="module" src="assets/js/main.js?v=2"></script>
</body>
</html>
