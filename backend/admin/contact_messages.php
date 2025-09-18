<?php require_once '_auth_guard.php'; ?>
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>联系我们 - DreamModa 管理后台</title>
    <link rel="stylesheet" href="assets/css/base.css">
    <link rel="stylesheet" href="assets/css/dashboard.css">
    <link rel="stylesheet" href="assets/css/contact_messages.css">
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
                    <li><a href="dashboard.php" class="nav-link"><i class="fas fa-box"></i> 产品管理</a></li>
                    <li><a href="contact_messages.php" class="nav-link active"><i class="fas fa-envelope"></i> 表单查询</a></li>
                    <li><a href="translations.php" class="nav-link"><i class="fas fa-language"></i> 多语言翻译</a></li>
                    <li><a href="../api/logout.php" class="nav-link logout"><i class="fas fa-sign-out-alt"></i> 退出登录</a></li>
                </ul>
            </div>
        </nav>

        <main class="main-content">
            <header class="main-header">
                <h2><i class="fas fa-envelope"></i> 表单查询</h2>
            </header>
            
            <section id="messages-section" class="messages-list-section">
                <div id="filter-bar" class="filter-bar">
                    <!-- Desktop filter dropdown (left): Status -->
                    <div class="filter-group" id="status-filter-group">
                        <button class="filter-button" id="status-filter-button">
                            <span>状态</span>
                            <span class="filter-current" id="status-filter-current"></span>
                            <i class="fas fa-chevron-down"></i>
                        </button>
                        <div class="filter-dropdown" id="status-filter-dropdown">
                            <div class="filter-option" data-status=""><label>全部</label></div>
                            <div class="filter-option" data-status="待定"><label>待处理</label></div>
                            <div class="filter-option" data-status="进行中"><label>处理中</label></div>
                            <div class="filter-option" data-status="完成"><label>完成</label></div>
                        </div>
                    </div>

                    <!-- Desktop filter controls -->
                    <div class="filter-controls desktop-only">
                        <div class="filter-search">
                            <i class="fas fa-search search-icon"></i>
                            <input type="text" id="search-messages" placeholder="搜索姓名、邮箱或留言内容...">
                        </div>
                        
                        <div class="filter-group" id="time-filter-group">
                            <label>时间</label>
                            <div class="filter-buttons" id="time-filters">
                                <button class="filter-btn active" data-time="">全部</button>
                                <button class="filter-btn" data-time="today">今天</button>
                                <button class="filter-btn" data-time="week">本周</button>
                                <button class="filter-btn" data-time="month">本月</button>
                            </div>
                        </div>
                        
                        <div class="filter-group" id="status-filter-group-buttons">
                            <label>状态</label>
                            <div class="filter-buttons" id="status-filters">
                                <button class="filter-btn active" data-status="">全部</button>
                                <button class="filter-btn" data-status="待定">待处理</button>
                                <button class="filter-btn" data-status="进行中">处理中</button>
                                <button class="filter-btn" data-status="完成">已完成</button>
                                <button class="filter-btn" data-status="未完成">未完成</button>
                            </div>
                        </div>
                        
                        <button id="clear-filters-btn" class="btn btn-secondary">
                            <i class="fas fa-times"></i> 清除筛选
                        </button>
                    </div>

                    <div class="filter-bar-actions">
                        <div class="filter-button-container">
                            <a href="filters_mobile.php?page=messages" class="btn btn-secondary mobile-only">
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

                <div class="table-container">
                    <table id="messages-table" class="messages-table">
                        <colgroup>
                            <col id="col-name" style="width: 12%;">
                            <col id="col-email" style="width: 18%;">
                            <col id="col-message" style="width: 30%;">
                            <col id="col-status" style="width: 12%;">
                            <col id="col-notes" style="width: 18%;">
                            <col id="col-date" style="width: 10%;">
                        </colgroup>
                        <thead>
                            <tr>
                                <th class="resizable-column" data-column="name">
                                    姓名
                                    <div class="resize-handle"></div>
                                </th>
                                <th class="resizable-column" data-column="email">
                                    邮箱
                                    <div class="resize-handle"></div>
                                </th>
                                <th class="resizable-column" data-column="message">
                                    留言内容
                                    <div class="resize-handle"></div>
                                </th>
                                <th class="resizable-column" data-column="status">
                                    状态
                                    <div class="resize-handle"></div>
                                </th>
                                <th class="resizable-column" data-column="notes">
                                    备注
                                    <div class="resize-handle"></div>
                                </th>
                                <th class="resizable-column" data-column="date">
                                    提交时间
                                </th>
                            </tr>
                        </thead>
                        <tbody id="messages-table-body">
                            <!-- Messages will be loaded here -->
                        </tbody>
                    </table>
                </div>
                <div id="messages-cards" class="messages-cards"></div>
                
                <div id="loading-indicator" class="loading-indicator" style="display: none;">
                    <div class="loading-spinner"></div>
                    <p>正在加载数据...</p>
                </div>
                
                <div id="empty-state" class="empty-state" style="display: none;">
                    <i class="fas fa-inbox"></i>
                    <h3>暂无表单数据</h3>
                    <p>当前没有找到符合条件的表单提交记录</p>
                </div>
            </section>
        </main>
    </div>

    <!-- Toast Notification -->
    <div id="toast-notification" class="toast"></div>

    <!-- Message Detail Modal -->
    <div id="message-modal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-envelope-open"></i> 表单详情</h3>
                <button class="modal-close" onclick="closeModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div id="message-details"></div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal()">
                    <i class="fas fa-times"></i> 关闭
                </button>
            </div>
        </div>
    </div>

    <!-- External JavaScript files -->
    <script src="assets/js/components/contact_messages/contact_messages_core.js"></script>
    <script src="assets/js/components/contact_messages/contact_messages_filters.js"></script>
    <script src="assets/js/components/contact_messages/contact_messages_modal.js"></script>
    <script src="assets/js/components/contact_messages/contact_messages_table.js"></script>
    <script src="assets/js/components/contact_messages/contact_messages_status.js"></script>
    <script>
        // Initialize contact messages functionality
        document.addEventListener('DOMContentLoaded', function() {
            console.log('Contact messages page loaded');
            loadMessages();
            
            // Setup functionality
            setupSortDropdown();
            setupInlineFilters();
            setupModalEventListeners();
            setupStatusDropdownListeners();
            
            // Bind search functionality
            const searchInput = document.getElementById('search-messages');
            if (searchInput) {
                searchInput.addEventListener('input', function(e) {
                    setFilter('search', e.target.value);
                });
            }
            
            // Bind status filter buttons
            document.querySelectorAll('#status-filters .filter-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    document.querySelectorAll('#status-filters .filter-btn').forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                    setFilter('status', this.getAttribute('data-status'));
                });
            });
            
            // Bind time filter buttons
            document.querySelectorAll('#time-filters .filter-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    document.querySelectorAll('#time-filters .filter-btn').forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                    setFilter('time', this.getAttribute('data-time'));
                });
            });
            
            // Bind clear filters button
            const clearFiltersBtn = document.getElementById('clear-filters-btn');
            if (clearFiltersBtn) {
                clearFiltersBtn.addEventListener('click', clearAllFilters);
            }
            
            // Initialize table resize functionality
            setTimeout(() => {
                initializeTableResize();
            }, 100);
        });
    </script>
</body>
</html>
