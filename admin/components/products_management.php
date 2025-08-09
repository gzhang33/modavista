<section id="products-management-section" class="content-section" data-section="products">
    <header class="main-header">
        <h2><i class="fas fa-box"></i> 产品展示管理</h2>
        <button id="add-product-btn" class="btn btn-primary">
            <i class="fas fa-plus"></i> 添加新产品
        </button>
    </header>
    
    <!-- Add/Edit Form Section (Initially Hidden) -->
    <section id="product-form-section" class="form-section hidden">
        <h3 id="form-title">添加新产品</h3>
        <form id="product-form">
            <input type="hidden" id="product-id" name="id">
            <input type="hidden" id="variants-meta" name="variants_meta" value="">
            <div class="form-row">
                <div class="form-group">
                    <label for="name">产品名称</label>
                    <input type="text" id="name" name="name" class="form-control" required>
                </div>
                <div class="form-group">
                    <label for="category">产品分类</label>
                    <select id="category" name="category" class="form-control" required>
                        <!-- Options will be populated by JS -->
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label for="description">产品描述</label>
                <textarea id="description" name="description" rows="4" class="form-control" required placeholder="描述产品的特点、材质、设计理念等..."></textarea>
            </div>
            <div class="form-group">
                <label for="media">产品媒体</label>
                <div id="current-media-previews" class="media-previews"></div>
                <input type="file" id="media" name="media[]" class="form-control-file" multiple accept="image/*">
                <small class="form-text">支持多张图片上传，用于产品展示画廊</small>
            </div>

            <!-- Variants Builder -->
            <div class="form-group">
                <label>颜色变体</label>
                <div id="variants-container" class="variants-container">
                    <!-- 动态添加每个变体行 -->
                </div>
                <button type="button" id="add-variant-row" class="btn btn-secondary btn-sm" style="margin-top:8px;">+ 添加颜色变体</button>
                <small class="form-text">每个变体会创建为独立产品记录。为每个变体设置颜色名称并上传对应图片。</small>
            </div>
            <div class="form-actions">
                <button type="submit" class="btn btn-success">
                    <i class="fas fa-save"></i> 保存产品
                </button>
                <button type="button" id="cancel-edit-btn" class="btn btn-secondary">
                    <i class="fas fa-times"></i> 取消
                </button>
            </div>
        </form>
    </section>

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
                <button id="bulk-archive-btn" class="btn bulk-archive-btn btn-sm"><i class="fas fa-archive"></i> 批量归档</button>
                <button id="bulk-unarchive-btn" class="btn bulk-unarchive-btn btn-sm"><i class="fas fa-undo"></i> 批量恢复</button>
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
                        <th>分类</th>
                        <th>变体</th>
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