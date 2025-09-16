<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>主页表单查询 - DreaModa 管理后台</title>
    <link rel="stylesheet" href="assets/css/base.css">
    <link rel="stylesheet" href="assets/css/dashboard.css">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        /* 现代化表格容器样式 */
        .table-container {
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            overflow: hidden;
            border: 1px solid #e5e7eb;
        }
        
        /* 表格基础样式 */
        .messages-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            table-layout: fixed;
        }
        
        /* 可调整大小的列 */
        .messages-table th,
        .messages-table td {
            position: relative;
            border-right: 1px solid #e5e7eb;
        }
        
        .messages-table th:last-child,
        .messages-table td:last-child {
            border-right: none;
        }
        
        /* 列调整手柄 */
        .resize-handle {
            position: absolute;
            top: 0;
            right: -2px;
            width: 4px;
            height: 100%;
            background: transparent;
            cursor: col-resize;
            z-index: 10;
        }
        
        .resize-handle:hover {
            background: #3b82f6;
        }
        
        .resize-handle.active {
            background: #1d4ed8;
        }
        
        /* 拖拽时的视觉反馈 */
        .messages-table.resizing {
            user-select: none;
        }
        
        .messages-table.resizing * {
            pointer-events: none;
        }
        
        .messages-table.resizing .resize-handle {
            pointer-events: auto;
        }
        
        /* 备注列样式 - 纯文字显示，支持双击编辑 */
        .notes-cell {
            max-width: 200px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            position: relative;
            cursor: pointer;
        }
        
        .notes-cell:hover {
            background-color: #f8f9fa;
        }
        
        .notes-edit-input {
            width: 100%;
            border: none;
            background: transparent;
            font-size: 14px;
            padding: 4px 8px;
            outline: none;
            resize: none;
            min-height: 20px;
            max-height: 60px;
            font-family: inherit;
            line-height: 1.2;
        }
        
        .notes-edit-actions {
            position: absolute;
            top: 100%;
            right: 0;
            background: white;
            border: 1px solid #ddd;
            border-radius: 4px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            z-index: 1000;
            display: flex;
            gap: 4px;
            padding: 4px;
        }
        
        .notes-edit-btn {
            padding: 4px 8px;
            border: none;
            border-radius: 3px;
            cursor: pointer;
            font-size: 12px;
            display: flex;
            align-items: center;
            gap: 2px;
        }
        
        .notes-save-btn {
            background: #28a745;
            color: white;
        }
        
        .notes-cancel-btn {
            background: #6c757d;
            color: white;
        }
        
        .notes-edit-btn:hover {
            opacity: 0.8;
        }
        
        /* 表格中备注内容的样式 - 纯文字显示 */
        .notes-cell .notes-content {
            color: #374151;
            font-size: 14px;
            line-height: 1.5;
        }
        
        /* 行调整手柄 */
        .row-resize-handle {
            position: absolute;
            bottom: -2px;
            left: 0;
            width: 100%;
            height: 4px;
            background: transparent;
            cursor: row-resize;
            z-index: 10;
        }
        
        .row-resize-handle:hover {
            background: #3b82f6;
        }
        
        .row-resize-handle.active {
            background: #1d4ed8;
        }
        
        /* 表头样式 */
        .messages-table thead {
            background: #f8fafc;
            border-bottom: 2px solid #e5e7eb;
        }
        
        .messages-table th {
            padding: 16px 20px;
            text-align: left;
            font-weight: 600;
            color: #374151;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .messages-table th:first-child {
            padding-left: 24px;
        }
        
        .messages-table th:last-child {
            padding-right: 24px;
        }
        
        /* 表格行样式 */
        .messages-table tbody tr {
            border-bottom: 1px solid #f3f4f6;
            transition: background-color 0.2s ease;
        }
        
        .messages-table tbody tr:hover {
            background-color: #f9fafb;
        }
        
        .messages-table tbody tr:last-child {
            border-bottom: none;
        }
        
        /* 单元格样式 */
        .messages-table td {
            padding: 16px 20px;
            vertical-align: middle;
            color: #374151;
        }
        
        .messages-table td:first-child {
            padding-left: 24px;
        }
        
        .messages-table td:last-child {
            padding-right: 24px;
        }
        
        /* 姓名单元格 */
        .message-name-cell {
            font-weight: 500;
            color: #111827;
            font-size: 14px;
        }
        
        /* 邮箱单元格 */
        .message-email-cell a {
            color: #3b82f6;
            text-decoration: none;
            font-weight: 500;
            transition: color 0.2s ease;
        }
        
        .message-email-cell a:hover {
            color: #1d4ed8;
            text-decoration: underline;
        }
        
        /* 留言内容单元格 */
        .message-content-cell {
            max-width: 350px;
            position: relative;
        }
        
        .clickable-content {
            cursor: pointer;
            transition: all 0.2s ease;
            padding: 8px;
            border-radius: 6px;
            margin: -8px;
        }
        
        .clickable-content:hover {
            background-color: #eff6ff;
            border: 1px solid #dbeafe;
        }
        
        .message-preview {
            line-height: 1.5;
            color: #6b7280;
            font-size: 13px;
        }
        
        .view-hint {
            font-size: 11px;
            color: #3b82f6;
            margin-top: 6px;
            opacity: 0.8;
            font-weight: 500;
        }
        
        .view-hint i {
            margin-right: 4px;
        }
        
        /* 状态单元格 */
        .message-status-cell {
            text-align: center;
        }
        
        .status-container {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
        }
        
        /* 状态下拉菜单容器 */
        .status-dropdown {
            position: relative;
            display: inline-block;
        }
        
        /* 可点击的状态徽章 */
        .clickable-status {
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            min-width: 100px;
            justify-content: center;
            position: relative;
        }
        
        .clickable-status:hover {
            transform: translateY(-1px);
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .dropdown-arrow {
            font-size: 10px;
            transition: transform 0.2s ease;
        }
        
        .clickable-status.active .dropdown-arrow {
            transform: rotate(180deg);
        }
        
        /* 下拉菜单 */
        .status-dropdown-menu {
            position: absolute;
            top: 100%;
            left: 50%;
            transform: translateX(-50%);
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
            z-index: 1000;
            min-width: 140px;
            margin-top: 4px;
        }
        
        .dropdown-item {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 10px 16px;
            cursor: pointer;
            transition: background-color 0.2s ease;
            font-size: 13px;
            font-weight: 500;
        }
        
        .dropdown-item:hover {
            background-color: #f9fafb;
        }
        
        .dropdown-item:first-child {
            border-radius: 8px 8px 0 0;
        }
        
        .dropdown-item:last-child {
            border-radius: 0 0 8px 8px;
        }
        
        .dropdown-item i {
            width: 16px;
            text-align: center;
        }
        
        /* 状态徽章样式 */
        .status-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-align: center;
            min-width: 80px;
            justify-content: center;
        }
        
        .status-待定 {
            background-color: #fef3c7;
            color: #92400e;
            border: 1px solid #fbbf24;
        }
        
        .status-进行中 {
            background-color: #dbeafe;
            color: #1e40af;
            border: 1px solid #3b82f6;
        }
        
        .status-完成 {
            background-color: #d1fae5;
            color: #065f46;
            border: 1px solid #10b981;
        }
        
        /* 备注按钮 */
        .notes-btn {
            background: none;
            border: none;
            color: #6b7280;
            cursor: pointer;
            padding: 8px;
            border-radius: 6px;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .notes-btn:hover {
            background-color: #f3f4f6;
            color: #374151;
        }
        
        /* 日期单元格 */
        .message-date-cell {
            color: #6b7280;
            font-size: 13px;
            font-weight: 500;
        }
        
        /* 弹窗样式 */
        .modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
        }
        
        .modal.show {
            opacity: 1;
            visibility: visible;
        }
        
        .modal-content {
            background: white;
            border-radius: 16px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            max-width: 600px;
            width: 90%;
            max-height: 80vh;
            overflow: hidden;
            transform: scale(0.9) translateY(20px);
            transition: transform 0.3s ease;
        }
        
        .modal.show .modal-content {
            transform: scale(1) translateY(0);
        }
        
        .modal-header {
            padding: 24px 24px 0 24px;
            border-bottom: 1px solid #e5e7eb;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        
        .modal-header h3 {
            margin: 0;
            font-size: 20px;
            font-weight: 600;
            color: #111827;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .modal-header h3 i {
            color: #3b82f6;
        }
        
        .modal-close {
            background: none;
            border: none;
            font-size: 24px;
            color: #6b7280;
            cursor: pointer;
            padding: 8px;
            border-radius: 8px;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
        }
        
        .modal-close:hover {
            background-color: #f3f4f6;
            color: #374151;
        }
        
        .modal-body {
            padding: 24px;
            max-height: 60vh;
            overflow-y: auto;
        }
        
        .modal-footer {
            padding: 0 24px 24px 24px;
            display: flex;
            justify-content: flex-end;
            align-items: center;
            gap: 12px;
        }
        
        /* 消息详情样式 */
        .message-detail-item {
            margin-bottom: 24px;
            padding-bottom: 20px;
            border-bottom: 1px solid #f3f4f6;
        }
        
        .message-detail-item:last-child {
            border-bottom: none;
            margin-bottom: 0;
        }
        
        .message-detail-item label {
            display: block;
            font-weight: 600;
            color: #374151;
            margin-bottom: 8px;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        
        .message-detail-item span {
            color: #6b7280;
            font-size: 15px;
            line-height: 1.5;
        }
        
        .message-detail-item a {
            color: #3b82f6;
            text-decoration: none;
            font-weight: 500;
        }
        
        .message-detail-item a:hover {
            text-decoration: underline;
        }
        
        .message-content {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            padding: 20px;
            border-radius: 12px;
            border-left: 4px solid #3b82f6;
            white-space: pre-wrap;
            line-height: 1.7;
            font-size: 15px;
            color: #374151;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .notes-textarea {
            width: 100%;
            padding: 12px;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            font-size: 14px;
            font-family: inherit;
            line-height: 1.5;
            resize: vertical;
            min-height: 80px;
            transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        
        .notes-textarea:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        .notes-textarea::placeholder {
            color: #9ca3af;
        }
        
        .status-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-align: center;
            min-width: 80px;
            justify-content: center;
        }
        
        .status-待定 {
            background-color: #fef3c7;
            color: #92400e;
            border: 1px solid #fbbf24;
        }
        
        .status-进行中 {
            background-color: #dbeafe;
            color: #1e40af;
            border: 1px solid #3b82f6;
        }
        
        .status-完成 {
            background-color: #d1fae5;
            color: #065f46;
            border: 1px solid #10b981;
        }
        
        /* 按钮样式 */
        .btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 10px 20px;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
            text-decoration: none;
        }
        
        .btn-secondary {
            background-color: #f3f4f6;
            color: #374151;
            border: 1px solid #d1d5db;
        }
        
        .btn-secondary:hover {
            background-color: #e5e7eb;
            border-color: #9ca3af;
        }
        
        .btn-primary {
            background-color: #3b82f6;
            color: white;
        }
        
        .btn-primary:hover {
            background-color: #2563eb;
        }
        
        .btn-info {
            background-color: #06b6d4;
            color: white;
        }
        
        .btn-info:hover {
            background-color: #0891b2;
        }
        
        .btn-success {
            background-color: #10b981;
            color: white;
        }
        
        .btn-success:hover {
            background-color: #059669;
        }
        
        .btn-warning {
            background-color: #f59e0b;
            color: white;
        }
        
        .btn-warning:hover {
            background-color: #d97706;
        }
        
        /* 筛选栏样式 */
        .filter-bar {
            background: white;
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 20px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .filter-bar-actions {
            display: flex;
            align-items: center;
            gap: 20px;
            flex-wrap: wrap;
        }
        
        .filter-search {
            position: relative;
            flex: 1;
            min-width: 250px;
        }
        
        .search-icon {
            position: absolute;
            left: 12px;
            top: 50%;
            transform: translateY(-50%);
            color: #6b7280;
            z-index: 1;
        }
        
        .filter-search input {
            width: 100%;
            padding: 10px 12px 10px 40px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            font-size: 14px;
            transition: border-color 0.2s ease;
        }
        
        .filter-search input:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        .filter-controls {
            display: flex;
            gap: 24px;
            flex-wrap: wrap;
        }
        
        .filter-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        
        .filter-group label {
            font-size: 12px;
            font-weight: 600;
            color: #374151;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        
        .filter-buttons {
            display: flex;
            gap: 4px;
            flex-wrap: wrap;
        }
        
        .filter-btn {
            padding: 6px 12px;
            border: 1px solid #d1d5db;
            background: white;
            color: #374151;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
            white-space: nowrap;
        }
        
        .filter-btn:hover {
            background-color: #f9fafb;
            border-color: #9ca3af;
        }
        
        .filter-btn.active {
            background-color: #3b82f6;
            color: white;
            border-color: #3b82f6;
        }
        
        .filter-btn.active:hover {
            background-color: #2563eb;
            border-color: #2563eb;
        }
        
        /* 响应式设计 */
        @media (max-width: 768px) {
            .modal-content {
                width: 95%;
                max-height: 90vh;
            }
            
            .modal-header,
            .modal-body,
            .modal-footer {
                padding: 16px;
            }
            
            .modal-header h3 {
                font-size: 18px;
            }
            
            .filter-bar-actions {
                flex-direction: column;
                align-items: stretch;
                gap: 16px;
            }
            
            .filter-search {
                min-width: auto;
            }
            
            .filter-controls {
                flex-direction: column;
                gap: 16px;
            }
            
            .filter-buttons {
                justify-content: flex-start;
            }
        }
        
        /* 空状态样式 */
        .text-center {
            text-align: center;
            padding: 3rem 2rem;
            color: #9ca3af;
            font-size: 14px;
        }
        
        /* 响应式设计 */
        @media (max-width: 768px) {
            .messages-table th,
            .messages-table td {
                padding: 12px 16px;
            }
            
            .messages-table th:first-child,
            .messages-table td:first-child {
                padding-left: 16px;
            }
            
            .messages-table th:last-child,
            .messages-table td:last-child {
                padding-right: 16px;
            }
            
            .message-content-cell {
                max-width: 250px;
            }
        }
    </style>
</head>
<body>
    <script>
        // 会话检查
        fetch('../api/check_session.php')
            .then(r => r.json())
            .then(d => { 
                if (!d.loggedIn) { 
                    console.log('Session check failed, redirecting to login');
                    location.href = 'login.html'; 
                } else {
                    console.log('Session valid, loading page');
                }
            })
            .catch((error) => {
                console.error('Session check error:', error);
                location.href = 'login.html';
            });
    </script>
    
    <div class="dashboard-container">
        <!-- 管理导航栏 -->
        <nav class="admin-nav-bar">
            <div class="nav-container">
                <div class="nav-brand">
                    <h3><i class="fas fa-cogs"></i> DreaModa 管理后台</h3>
                </div>
                <ul class="nav-links">
                    <li><a href="dashboard.php" class="nav-link"><i class="fas fa-box"></i> 产品管理</a></li>
                    <li><a href="contact_messages.php" class="nav-link active"><i class="fas fa-envelope"></i> 主页表单查询</a></li>
                    <li><a href="translations.php" class="nav-link"><i class="fas fa-language"></i> 多语言翻译</a></li>
                    <li><a href="../api/logout.php" class="nav-link logout"><i class="fas fa-sign-out-alt"></i> 退出登录</a></li>
                </ul>
            </div>
        </nav>

        <main class="main-content">
            <header class="main-header">
                <h2><i class="fas fa-envelope"></i> 主页表单查询</h2>
                <div class="header-actions">
                    <button id="reset-table-btn" class="btn btn-secondary" onclick="resetTableSettings()" title="重置表格布局">
                        <i class="fas fa-undo"></i> 重置布局
                    </button>
                    <button id="refresh-btn" class="btn btn-primary">
                        <i class="fas fa-sync-alt"></i> 刷新数据
                    </button>
                </div>
            </header>
            
            <section id="messages-section" class="messages-list-section">
                <div id="filter-bar" class="filter-bar">
                    <div class="filter-bar-actions">
                        <div class="filter-search">
                            <i class="fas fa-search search-icon"></i>
                            <input type="text" id="search-messages" placeholder="搜索姓名、邮箱或留言内容..." />
                        </div>
                        <div class="filter-controls">
                            <div class="filter-group">
                                <label>状态筛选:</label>
                                <div class="filter-buttons" id="status-filters">
                                    <button class="filter-btn active" data-status="">全部</button>
                                    <button class="filter-btn" data-status="待定">待处理</button>
                                    <button class="filter-btn" data-status="进行中">处理中</button>
                                    <button class="filter-btn" data-status="完成">已完成</button>
                                    <button class="filter-btn" data-status="未完成">未完成</button>
                                </div>
                            </div>
                            <div class="filter-group">
                                <label>时间筛选:</label>
                                <div class="filter-buttons" id="time-filters">
                                    <button class="filter-btn active" data-time="">全部</button>
                                    <button class="filter-btn" data-time="today">今天</button>
                                    <button class="filter-btn" data-time="week">本周</button>
                                    <button class="filter-btn" data-time="month">本月</button>
                                    <button class="filter-btn" data-time="year">今年</button>
                                </div>
                            </div>
                        </div>
                        <button id="clear-filters-btn" class="btn btn-secondary btn-sm">清除筛选</button>
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


    <script>
        // Simple contact messages functionality
        let contactMessages = [];
        let filteredMessages = [];
        let currentModalMessageId = null;
        let currentFilters = {
            search: '',
            status: '',
            time: ''
        };
        
        function showToast(message, type = 'success') {
            const toast = document.getElementById('toast-notification');
            if (toast) {
                toast.textContent = message;
                toast.className = `toast toast-${type}`;
                toast.style.display = 'block';
                setTimeout(() => {
                    toast.style.display = 'none';
                }, 3000);
            }
        }
        
        function showLoading() {
            const loading = document.getElementById('loading-indicator');
            if (loading) {
                loading.style.display = 'block';
            }
        }
        
        function hideLoading() {
            const loading = document.getElementById('loading-indicator');
            if (loading) {
                loading.style.display = 'none';
            }
        }
        
        function loadMessages() {
            showLoading();
            console.log('Loading contact messages...');
            
            fetch('../api/contact_messages.php')
            .then(response => {
                console.log('API response status:', response.status);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                return response.json();
            })
            .then(data => {
                console.log('API response data:', data);
                
                if (data.success) {
                    contactMessages = data.data || [];
                    console.log('Loaded messages:', contactMessages);
                    applyFilters(); // 应用当前筛选条件
                    showToast('数据加载成功', 'success');
                } else {
                    throw new Error(data.message || 'Failed to load messages');
                }
            })
            .catch(error => {
                console.error('Error loading messages:', error);
                showToast('加载数据失败: ' + error.message, 'error');
                contactMessages = [];
                filteredMessages = [];
                renderMessages();
            })
            .finally(() => {
                hideLoading();
            });
        }
        
        function renderMessages() {
            const tableBody = document.getElementById('messages-table-body');
            if (!tableBody) return;
            
            if (filteredMessages.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="6" class="text-center" style="padding: 2rem; color: #666;">没有找到符合条件的表单数据</td></tr>';
                return;
            }
            
            tableBody.innerHTML = filteredMessages.map(message => `
                <tr class="message-row resizable-row" data-id="${message.id}" style="height: 60px;">
                    <td class="message-name-cell">${escapeHtml(message.name)}</td>
                    <td class="message-email-cell">
                        <a href="mailto:${escapeHtml(message.email)}" class="email-link">
                            ${escapeHtml(message.email)}
                        </a>
                    </td>
                    <td class="message-content-cell clickable-content" onclick="viewMessage(${message.id})" title="点击查看详情">
                        <div class="message-preview">
                            ${truncateText(escapeHtml(message.message), 100)}
                        </div>
                        <div class="view-hint">
                            <i class="fas fa-eye"></i> 点击查看详情
                        </div>
                    </td>
                    <td class="message-status-cell">
                        <div class="status-container">
                            <div class="status-dropdown" data-message-id="${message.id}">
                                <div class="status-badge status-${message.todo.status} clickable-status" onclick="toggleStatusDropdown(${message.id})">
                                    <i class="fas ${getStatusIcon(message.todo.status)}"></i>
                                    ${getStatusText(message.todo.status)}
                                    <i class="fas fa-chevron-down dropdown-arrow"></i>
                                </div>
                                <div class="status-dropdown-menu" id="dropdown-${message.id}" style="display: none;">
                                    <div class="dropdown-item" onclick="updateStatus(${message.id}, '待定')">
                                        <i class="fas fa-clock"></i>
                                        <span>待处理</span>
                                    </div>
                                    <div class="dropdown-item" onclick="updateStatus(${message.id}, '进行中')">
                                        <i class="fas fa-spinner"></i>
                                        <span>处理中</span>
                                    </div>
                                    <div class="dropdown-item" onclick="updateStatus(${message.id}, '完成')">
                                        <i class="fas fa-check-circle"></i>
                                        <span>已完成</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </td>
                    <td class="notes-cell" ondblclick="startEditNotes(${message.id})" title="双击编辑备注">
                        <div class="notes-content" data-message-id="${message.id}">
                            ${message.todo.notes ? escapeHtml(message.todo.notes) : ''}
                        </div>
                    </td>
                    <td class="message-date-cell">${formatDateTime(message.created_at)}</td>
                    <div class="row-resize-handle"></div>
                </tr>
            `).join('');
            
            // 重新初始化行调整功能
            setTimeout(() => {
                initializeRowResize();
            }, 50);
        }
        
        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
        
        function truncateText(text, maxLength) {
            if (text.length <= maxLength) return text;
            return text.substring(0, maxLength) + '...';
        }
        
        function formatDateTime(dateString) {
            const date = new Date(dateString);
            return date.toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
        
        function getStatusIcon(status) {
            switch(status) {
                case '待定': return 'fa-clock';
                case '进行中': return 'fa-spinner';
                case '完成': return 'fa-check-circle';
                default: return 'fa-question';
            }
        }
        
        function getStatusText(status) {
            switch(status) {
                case '待定': return '待处理';
                case '进行中': return '处理中';
                case '完成': return '已完成';
                default: return '未知';
            }
        }
        
        // 筛选功能
        function applyFilters() {
            filteredMessages = contactMessages.filter(message => {
                // 搜索筛选
                if (currentFilters.search) {
                    const searchTerm = currentFilters.search.toLowerCase();
                    const searchableText = `${message.name} ${message.email} ${message.message}`.toLowerCase();
                    if (!searchableText.includes(searchTerm)) {
                        return false;
                    }
                }
                
                // 状态筛选
                if (currentFilters.status) {
                    if (currentFilters.status === '未完成') {
                        // 未完成包括待定和进行中
                        if (message.todo.status !== '待定' && message.todo.status !== '进行中') {
                            return false;
                        }
                    } else {
                        // 其他状态精确匹配
                        if (message.todo.status !== currentFilters.status) {
                            return false;
                        }
                    }
                }
                
                // 时间筛选
                if (currentFilters.time) {
                    const messageDate = new Date(message.created_at);
                    const now = new Date();
                    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    
                    switch (currentFilters.time) {
                        case 'today':
                            const messageToday = new Date(messageDate.getFullYear(), messageDate.getMonth(), messageDate.getDate());
                            if (messageToday.getTime() !== today.getTime()) {
                                return false;
                            }
                            break;
                        case 'week':
                            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                            if (messageDate < weekAgo) {
                                return false;
                            }
                            break;
                        case 'month':
                            const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                            if (messageDate < monthAgo) {
                                return false;
                            }
                            break;
                        case 'year':
                            const yearAgo = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);
                            if (messageDate < yearAgo) {
                                return false;
                            }
                            break;
                    }
                }
                
                return true;
            });
            
            renderMessages();
        }
        
        // 设置筛选器
        function setFilter(type, value) {
            currentFilters[type] = value;
            applyFilters();
        }
        
        // 清除所有筛选
        function clearAllFilters() {
            currentFilters = {
                search: '',
                status: '',
                time: ''
            };
            
            // 重置搜索框
            const searchInput = document.getElementById('search-messages');
            if (searchInput) {
                searchInput.value = '';
            }
            
            // 重置筛选按钮
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // 激活"全部"按钮
            document.querySelectorAll('.filter-btn[data-status=""], .filter-btn[data-time=""]').forEach(btn => {
                btn.classList.add('active');
            });
            
            applyFilters();
        }
        
        function toggleStatusDropdown(messageId) {
            // 关闭所有其他下拉菜单
            document.querySelectorAll('.status-dropdown-menu').forEach(menu => {
                if (menu.id !== `dropdown-${messageId}`) {
                    menu.style.display = 'none';
                }
            });
            
            // 移除所有active类
            document.querySelectorAll('.clickable-status').forEach(status => {
                status.classList.remove('active');
            });
            
            // 切换当前下拉菜单
            const dropdown = document.getElementById(`dropdown-${messageId}`);
            const statusBadge = document.querySelector(`[data-message-id="${messageId}"] .clickable-status`);
            
            if (dropdown.style.display === 'none' || dropdown.style.display === '') {
                dropdown.style.display = 'block';
                statusBadge.classList.add('active');
            } else {
                dropdown.style.display = 'none';
                statusBadge.classList.remove('active');
            }
        }
        
        // 点击页面其他地方关闭下拉菜单
        document.addEventListener('click', function(event) {
            if (!event.target.closest('.status-dropdown')) {
                document.querySelectorAll('.status-dropdown-menu').forEach(menu => {
                    menu.style.display = 'none';
                });
                document.querySelectorAll('.clickable-status').forEach(status => {
                    status.classList.remove('active');
                });
            }
        });
        
        function viewMessage(messageId) {
            const message = contactMessages.find(m => m.id === messageId);
            if (!message) return;
            
            // 保存当前消息ID
            currentModalMessageId = messageId;
            
            const modal = document.getElementById('message-modal');
            const details = document.getElementById('message-details');
            
            details.innerHTML = `
                <div class="message-detail-item">
                    <label>姓名</label>
                    <span>${escapeHtml(message.name)}</span>
                </div>
                <div class="message-detail-item">
                    <label>邮箱</label>
                    <span><a href="mailto:${escapeHtml(message.email)}">${escapeHtml(message.email)}</a></span>
                </div>
                <div class="message-detail-item">
                    <label>留言内容</label>
                    <div class="message-content">${escapeHtml(message.message)}</div>
                </div>
                <div class="message-detail-item">
                    <label>IP地址</label>
                    <span>${escapeHtml(message.ip_address || '—')}</span>
                </div>
                <div class="message-detail-item">
                    <label>提交时间</label>
                    <span>${formatDateTime(message.created_at)}</span>
                </div>
                <div class="message-detail-item">
                    <label>当前状态</label>
                    <div class="status-dropdown" data-message-id="${message.id}">
                        <div class="status-badge status-${message.todo.status} clickable-status" onclick="toggleModalStatusDropdown(${message.id})">
                            <i class="fas ${getStatusIcon(message.todo.status)}"></i>
                            ${getStatusText(message.todo.status)}
                            <i class="fas fa-chevron-down dropdown-arrow"></i>
                        </div>
                        <div class="status-dropdown-menu" id="modal-dropdown-${message.id}" style="display: none;">
                            <div class="dropdown-item" onclick="updateStatusFromModal(${message.id}, '待定')">
                                <i class="fas fa-clock"></i>
                                <span>待处理</span>
                            </div>
                            <div class="dropdown-item" onclick="updateStatusFromModal(${message.id}, '进行中')">
                                <i class="fas fa-spinner"></i>
                                <span>处理中</span>
                            </div>
                            <div class="dropdown-item" onclick="updateStatusFromModal(${message.id}, '完成')">
                                <i class="fas fa-check-circle"></i>
                                <span>已完成</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="message-detail-item">
                    <label>备注</label>
                    <textarea class="notes-textarea" id="modal-notes-textarea" placeholder="输入备注内容..." rows="1">${escapeHtml(message.todo.notes || '')}</textarea>
                </div>
            `;
            
            // 初始化备注编辑功能
            initializeNotesEditing();
            
            // 显示弹窗
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
        
        function updateStatus(messageId, newStatus) {
            const message = contactMessages.find(m => m.id === messageId);
            if (!message) return;
            
            // 关闭下拉菜单
            const dropdown = document.getElementById(`dropdown-${messageId}`);
            const statusBadge = document.querySelector(`[data-message-id="${messageId}"] .clickable-status`);
            if (dropdown) dropdown.style.display = 'none';
            if (statusBadge) statusBadge.classList.remove('active');
            
            const currentNotes = message.todo ? message.todo.notes || '' : '';
            saveTodo(messageId, newStatus, currentNotes);
        }
        
        function openNotesModal(messageId) {
            const message = contactMessages.find(m => m.id === messageId);
            if (!message) return;
            
            const currentNotes = message.todo ? message.todo.notes || '' : '';
            const notes = prompt('请输入备注:', currentNotes);
            if (notes !== null) {
                const currentStatus = message.todo ? message.todo.status : '待定';
                saveTodo(messageId, currentStatus, notes);
            }
        }
        
        function saveTodo(messageId, status, notes) {
            const formData = {
                action: 'update_todo',
                message_id: messageId,
                status: status,
                notes: notes
            };
            
            fetch('../api/contact_messages.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(result => {
                if (result.success) {
                    showToast('保存成功', 'success');
                    
                    // 更新本地数据
                    const message = contactMessages.find(m => m.id === messageId);
                    if (message) {
                        message.todo.status = status;
                        message.todo.notes = notes;
                        message.is_processed = (status === '完成') ? true : false;
                        message.processed_at = (status === '完成') ? new Date().toISOString() : null;
                    }
                    
                    // 如果弹窗打开，更新弹窗显示
                    if (currentModalMessageId === messageId) {
                        updateModalDisplay();
                    }
                    
                    // 重新渲染表格
                    renderMessages();
                } else {
                    throw new Error(result.message || 'Failed to save todo');
                }
            })
            .catch(error => {
                console.error('Error saving todo:', error);
                showToast('保存失败: ' + error.message, 'error');
            });
        }
        
        function closeModal() {
            const modal = document.getElementById('message-modal');
            if (modal) {
                modal.classList.remove('show');
                document.body.style.overflow = '';
                currentModalMessageId = null;
            }
        }
        
        // 初始化备注编辑功能
        function initializeNotesEditing() {
            const notesTextarea = document.getElementById('modal-notes-textarea');
            if (!notesTextarea) return;
            
            let saveTimeout;
            
            // 监听输入变化，自动保存
            notesTextarea.addEventListener('input', function() {
                clearTimeout(saveTimeout);
                saveTimeout = setTimeout(() => {
                    saveNotesFromModal();
                }, 1000); // 1秒后自动保存
            });
            
            // 失去焦点时立即保存
            notesTextarea.addEventListener('blur', function() {
                clearTimeout(saveTimeout);
                saveNotesFromModal();
            });
        }
        
        // 从弹窗保存备注
        function saveNotesFromModal() {
            if (!currentModalMessageId) return;
            
            const notesTextarea = document.getElementById('modal-notes-textarea');
            if (!notesTextarea) return;
            
            const message = contactMessages.find(m => m.id === currentModalMessageId);
            if (!message) return;
            
            const newNotes = notesTextarea.value.trim();
            const currentNotes = message.todo ? message.todo.notes || '' : '';
            
            // 如果备注没有变化，不执行保存
            if (newNotes === currentNotes) return;
            
            const currentStatus = message.todo ? message.todo.status : '待定';
            saveTodo(currentModalMessageId, currentStatus, newNotes);
        }
        
        // 弹窗状态下拉菜单切换
        function toggleModalStatusDropdown(messageId) {
            // 关闭所有其他下拉菜单
            document.querySelectorAll('.status-dropdown-menu').forEach(menu => {
                if (menu.id !== `modal-dropdown-${messageId}`) {
                    menu.style.display = 'none';
                }
            });
            
            // 移除所有active类
            document.querySelectorAll('.clickable-status').forEach(status => {
                status.classList.remove('active');
            });
            
            // 切换当前下拉菜单
            const dropdown = document.getElementById(`modal-dropdown-${messageId}`);
            const statusBadge = document.querySelector(`[data-message-id="${messageId}"] .clickable-status`);
            
            if (dropdown.style.display === 'none' || dropdown.style.display === '') {
                dropdown.style.display = 'block';
                statusBadge.classList.add('active');
            } else {
                dropdown.style.display = 'none';
                statusBadge.classList.remove('active');
            }
        }
        
        // 从弹窗更新状态
        function updateStatusFromModal(messageId, newStatus) {
            const message = contactMessages.find(m => m.id === messageId);
            if (!message) return;
            
            // 关闭下拉菜单
            const dropdown = document.getElementById(`modal-dropdown-${messageId}`);
            const statusBadge = document.querySelector(`[data-message-id="${messageId}"] .clickable-status`);
            if (dropdown) dropdown.style.display = 'none';
            if (statusBadge) statusBadge.classList.remove('active');
            
            const currentNotes = message.todo ? message.todo.notes || '' : '';
            saveTodo(messageId, newStatus, currentNotes);
        }
        
        // 更新弹窗显示内容
        function updateModalDisplay() {
            if (!currentModalMessageId) return;
            
            const message = contactMessages.find(m => m.id === currentModalMessageId);
            if (!message) return;
            
            // 更新状态显示
            const statusBadge = document.querySelector(`[data-message-id="${currentModalMessageId}"] .clickable-status`);
            if (statusBadge) {
                statusBadge.className = `status-badge status-${message.todo.status} clickable-status`;
                statusBadge.innerHTML = `
                    <i class="fas ${getStatusIcon(message.todo.status)}"></i>
                    ${getStatusText(message.todo.status)}
                    <i class="fas fa-chevron-down dropdown-arrow"></i>
                `;
            }
            
            // 更新备注显示
            const notesTextarea = document.getElementById('modal-notes-textarea');
            if (notesTextarea) {
                notesTextarea.value = message.todo.notes || '';
            }
        }
        
        
        // 点击模态框外部关闭
        document.addEventListener('click', function(event) {
            const modal = document.getElementById('message-modal');
            if (event.target === modal) {
                closeModal();
            }
        });
        
        // ESC键关闭弹窗
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
                closeModal();
            }
        });
        
        // 表格调整大小功能
        function initializeTableResize() {
            // 加载保存的设置
            loadTableSettings();
            
            // 初始化列调整
            initializeColumnResize();
            
            // 初始化行调整
            initializeRowResize();
        }
        
        function initializeColumnResize() {
            const resizeHandles = document.querySelectorAll('.resize-handle');
            const table = document.getElementById('messages-table');
            const colgroup = table.querySelector('colgroup');
            const cols = colgroup.querySelectorAll('col');
            
            resizeHandles.forEach((handle, index) => {
                let isResizing = false;
                let startX = 0;
                let startWidth = 0;
                let currentCol = null;
                
                handle.addEventListener('mousedown', (e) => {
                    isResizing = true;
                    startX = e.clientX;
                    currentCol = cols[index];
                    startWidth = currentCol.offsetWidth;
                    
                    handle.classList.add('active');
                    document.body.style.cursor = 'col-resize';
                    document.body.style.userSelect = 'none';
                    
                    // 添加拖拽时的视觉反馈
                    table.classList.add('resizing');
                    
                    e.preventDefault();
                });
                
                document.addEventListener('mousemove', (e) => {
                    if (!isResizing || !currentCol) return;
                    
                    const deltaX = e.clientX - startX;
                    const newWidth = Math.max(50, Math.min(500, startWidth + deltaX)); // 限制在50-500px之间
                    
                    // 直接修改col元素的宽度，这是最新的最佳实践
                    currentCol.style.width = newWidth + 'px';
                });
                
                document.addEventListener('mouseup', () => {
                    if (isResizing) {
                        isResizing = false;
                        handle.classList.remove('active');
                        document.body.style.cursor = '';
                        document.body.style.userSelect = '';
                        table.classList.remove('resizing');
                        
                        // 保存列宽设置
                        saveTableSettings();
                    }
                });
            });
        }
        
        function initializeRowResize() {
            const rowResizeHandles = document.querySelectorAll('.row-resize-handle');
            
            rowResizeHandles.forEach(handle => {
                let isResizing = false;
                let startY = 0;
                let startHeight = 0;
                let row = null;
                
                handle.addEventListener('mousedown', (e) => {
                    isResizing = true;
                    startY = e.clientY;
                    row = handle.parentElement;
                    startHeight = row.offsetHeight;
                    
                    handle.classList.add('active');
                    document.body.style.cursor = 'row-resize';
                    document.body.style.userSelect = 'none';
                    
                    e.preventDefault();
                });
                
                document.addEventListener('mousemove', (e) => {
                    if (!isResizing) return;
                    
                    const deltaY = e.clientY - startY;
                    const newHeight = Math.max(40, startHeight + deltaY); // 最小高度40px
                    
                    row.style.height = newHeight + 'px';
                });
                
                document.addEventListener('mouseup', () => {
                    if (isResizing) {
                        isResizing = false;
                        handle.classList.remove('active');
                        document.body.style.cursor = '';
                        document.body.style.userSelect = '';
                        
                        // 保存行高设置
                        saveTableSettings();
                    }
                });
            });
        }
        
        // 保存表格设置到本地存储
        function saveTableSettings() {
            const settings = {
                columnWidths: {},
                defaultRowHeight: 60
            };
            
            // 保存列宽 - 使用colgroup中的col元素
            const table = document.getElementById('messages-table');
            const colgroup = table.querySelector('colgroup');
            const cols = colgroup.querySelectorAll('col');
            const columnNames = ['name', 'email', 'message', 'status', 'notes', 'date'];
            
            cols.forEach((col, index) => {
                if (columnNames[index]) {
                    settings.columnWidths[columnNames[index]] = col.style.width || col.offsetWidth + 'px';
                }
            });
            
            // 保存默认行高
            const firstRow = document.querySelector('.resizable-row');
            if (firstRow) {
                settings.defaultRowHeight = parseInt(firstRow.style.height) || 60;
            }
            
            localStorage.setItem('contactMessagesTableSettings', JSON.stringify(settings));
        }
        
        // 加载表格设置
        function loadTableSettings() {
            const savedSettings = localStorage.getItem('contactMessagesTableSettings');
            if (!savedSettings) return;
            
            try {
                const settings = JSON.parse(savedSettings);
                
                // 应用列宽设置 - 使用colgroup中的col元素
                if (settings.columnWidths) {
                    const table = document.getElementById('messages-table');
                    const colgroup = table.querySelector('colgroup');
                    const cols = colgroup.querySelectorAll('col');
                    const columnNames = ['name', 'email', 'message', 'status', 'notes', 'date'];
                    
                    columnNames.forEach((columnName, index) => {
                        if (settings.columnWidths[columnName] && cols[index]) {
                            cols[index].style.width = settings.columnWidths[columnName];
                        }
                    });
                }
                
                // 应用默认行高设置
                if (settings.defaultRowHeight) {
                    document.querySelectorAll('.resizable-row').forEach(row => {
                        row.style.height = settings.defaultRowHeight + 'px';
                    });
                }
            } catch (e) {
                console.error('Error loading table settings:', e);
            }
        }
        
        // 重置表格设置
        function resetTableSettings() {
            localStorage.removeItem('contactMessagesTableSettings');
            
            // 重置为默认值 - 使用colgroup中的col元素
            const table = document.getElementById('messages-table');
            const colgroup = table.querySelector('colgroup');
            const cols = colgroup.querySelectorAll('col');
            const defaultWidths = ['12%', '18%', '30%', '12%', '18%', '10%'];
            
            cols.forEach((col, index) => {
                if (defaultWidths[index]) {
                    col.style.width = defaultWidths[index];
                }
            });
            
            document.querySelectorAll('.resizable-row').forEach(row => {
                row.style.height = '60px';
            });
        }
        
        // 开始编辑备注
        function startEditNotes(messageId) {
            const cell = document.querySelector(`.notes-cell[ondblclick="startEditNotes(${messageId})"]`);
            const contentDiv = cell.querySelector('.notes-content');
            const currentNotes = contentDiv.textContent || '';
            
            // 创建编辑输入框
            const textarea = document.createElement('textarea');
            textarea.className = 'notes-edit-input';
            textarea.value = currentNotes;
            textarea.placeholder = '输入备注内容...';
            
            // 创建操作按钮
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'notes-edit-actions';
            actionsDiv.innerHTML = `
                <button class="notes-edit-btn notes-save-btn" onclick="saveInlineNotes(${messageId})">
                    <i class="fas fa-check"></i> 保存
                </button>
                <button class="notes-edit-btn notes-cancel-btn" onclick="cancelEditNotes(${messageId})">
                    <i class="fas fa-times"></i> 取消
                </button>
            `;
            
            // 替换内容
            cell.innerHTML = '';
            cell.appendChild(textarea);
            cell.appendChild(actionsDiv);
            
            // 聚焦并选中文本
            textarea.focus();
            textarea.select();
            
            // 自动调整高度
            textarea.style.height = 'auto';
            const contentHeight = textarea.scrollHeight;
            textarea.style.height = Math.max(20, Math.min(contentHeight, 60)) + 'px';
            
            // 监听输入变化，自动调整高度
            textarea.addEventListener('input', function() {
                this.style.height = 'auto';
                const newHeight = this.scrollHeight;
                this.style.height = Math.max(20, Math.min(newHeight, 60)) + 'px';
            });
            
            // 监听键盘事件
            textarea.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' && e.ctrlKey) {
                    e.preventDefault();
                    saveInlineNotes(messageId);
                } else if (e.key === 'Escape') {
                    e.preventDefault();
                    cancelEditNotes(messageId);
                }
            });
        }
        
        // 保存内联编辑的备注
        function saveInlineNotes(messageId) {
            const cell = document.querySelector(`.notes-cell[ondblclick="startEditNotes(${messageId})"]`);
            const textarea = cell.querySelector('.notes-edit-input');
            const newNotes = textarea.value.trim();
            
            // 获取当前消息的状态
            const message = contactMessages.find(m => m.id === messageId);
            if (!message) return;
            
            // 调用保存函数
            saveTodo(messageId, message.todo.status, newNotes);
            
            // 恢复显示状态
            cell.innerHTML = `
                <div class="notes-content" data-message-id="${messageId}">
                    ${newNotes ? escapeHtml(newNotes) : ''}
                </div>
            `;
        }
        
        // 取消编辑备注
        function cancelEditNotes(messageId) {
            const cell = document.querySelector(`.notes-cell[ondblclick="startEditNotes(${messageId})"]`);
            const message = contactMessages.find(m => m.id === messageId);
            if (!message) return;
            
            // 恢复显示状态
            cell.innerHTML = `
                <div class="notes-content" data-message-id="${messageId}">
                    ${message.todo.notes ? escapeHtml(message.todo.notes) : ''}
                </div>
            `;
        }

        // 点击外部区域取消编辑
        document.addEventListener('click', function(e) {
            // 如果点击的不是编辑相关的元素，取消所有编辑状态
            if (!e.target.closest('.notes-edit-actions') && !e.target.closest('.notes-edit-input')) {
                const editingCells = document.querySelectorAll('.notes-cell');
                editingCells.forEach(cell => {
                    // 检查是否包含编辑输入框
                    if (cell.querySelector('.notes-edit-input')) {
                        const messageId = cell.getAttribute('ondblclick').match(/startEditNotes\((\d+)\)/)[1];
                        cancelEditNotes(parseInt(messageId));
                    }
                });
            }
        });

        // Initialize on page load
        document.addEventListener('DOMContentLoaded', function() {
            console.log('Contact messages page loaded');
            loadMessages();
            
            // Bind refresh button
            const refreshBtn = document.getElementById('refresh-btn');
            if (refreshBtn) {
                refreshBtn.addEventListener('click', loadMessages);
            }
            
            // 绑定搜索功能
            const searchInput = document.getElementById('search-messages');
            if (searchInput) {
                searchInput.addEventListener('input', function(e) {
                    setFilter('search', e.target.value);
                });
            }
            
            // 绑定状态筛选按钮
            document.querySelectorAll('#status-filters .filter-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    // 移除同组其他按钮的active状态
                    document.querySelectorAll('#status-filters .filter-btn').forEach(b => b.classList.remove('active'));
                    // 激活当前按钮
                    this.classList.add('active');
                    // 设置筛选
                    setFilter('status', this.getAttribute('data-status'));
                });
            });
            
            // 绑定时间筛选按钮
            document.querySelectorAll('#time-filters .filter-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    // 移除同组其他按钮的active状态
                    document.querySelectorAll('#time-filters .filter-btn').forEach(b => b.classList.remove('active'));
                    // 激活当前按钮
                    this.classList.add('active');
                    // 设置筛选
                    setFilter('time', this.getAttribute('data-time'));
                });
            });
            
            // 绑定清除筛选按钮
            const clearFiltersBtn = document.getElementById('clear-filters-btn');
            if (clearFiltersBtn) {
                clearFiltersBtn.addEventListener('click', clearAllFilters);
            }
            
            // 初始化表格调整功能
            setTimeout(() => {
                initializeTableResize();
            }, 100);
        });
    </script>
</body>
</html>
