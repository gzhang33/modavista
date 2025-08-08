<section id="dashboard-stats-section" class="content-section active" data-section="dashboard">
    <header class="main-header">
        <h2><i class="fas fa-chart-line"></i> 展示统计概览</h2>
        <div class="header-actions">
            <button id="refresh-stats" class="btn btn-secondary">
                <i class="fas fa-sync-alt"></i> 刷新数据
            </button>
        </div>
    </header>

    <!-- 统计卡片 -->
    <div class="stats-grid">
        <div class="stat-card">
            <div class="stat-icon">
                <i class="fas fa-box"></i>
            </div>
            <div class="stat-content">
                <h3 id="total-products">0</h3>
                <p>展示产品总数</p>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon">
                <i class="fas fa-eye"></i>
            </div>
            <div class="stat-content">
                <h3 id="total-views">0</h3>
                <p>总浏览量</p>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon">
                <i class="fas fa-tags"></i>
            </div>
            <div class="stat-content">
                <h3 id="total-categories">0</h3>
                <p>产品分类数</p>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon">
                <i class="fas fa-images"></i>
            </div>
            <div class="stat-content">
                <h3 id="total-media">0</h3>
                <p>媒体文件数</p>
            </div>
        </div>
    </div>

    <!-- 热门产品 -->
    <div class="dashboard-row">
        <div class="dashboard-col">
            <div class="widget">
                <div class="widget-header">
                    <h3><i class="fas fa-fire"></i> 热门展示产品</h3>
                </div>
                <div class="widget-content">
                    <div id="popular-products" class="popular-products-list">
                        <!-- 动态生成 -->
                    </div>
                </div>
            </div>
        </div>
        <div class="dashboard-col">
            <div class="widget">
                <div class="widget-header">
                    <h3><i class="fas fa-chart-pie"></i> 分类分布</h3>
                </div>
                <div class="widget-content">
                    <div id="category-distribution" class="category-chart">
                        <!-- 动态生成 -->
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- 最近活动 -->
    <div class="widget">
        <div class="widget-header">
            <h3><i class="fas fa-clock"></i> 最近更新</h3>
        </div>
        <div class="widget-content">
            <div id="recent-activities" class="activity-list">
                <!-- 动态生成 -->
            </div>
        </div>
    </div>
</section>