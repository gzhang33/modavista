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
        // 进入后台前做一次服务端会话校验
        fetch('../api/check_session.php')
            .then(r => r.json())
            .then(data => {
                if (!data.loggedIn) {
                    window.location.href = 'login.html';
                }
            })
            .catch(() => {
                window.location.href = 'login.html';
            });
    </script>
    <div class="dashboard-container">
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
                                    <th>图片</th>
                                    <th>产品名称</th>
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
            </section>
        </main>
    </div>
    


<!-- Toast Notification -->
<div id="toast-notification" class="toast"></div>

    <script type="module" src="assets/js/main.js"></script>
</body>
</html>
