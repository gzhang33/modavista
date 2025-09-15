<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>主页表单查询 - DreaModa 管理后台</title>
    <link rel="stylesheet" href="assets/css/base.css">
    <link rel="stylesheet" href="assets/css/dashboard.css">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
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
                            <select id="date-filter" class="form-control">
                                <option value="">所有时间</option>
                                <option value="today">今天</option>
                                <option value="week">本周</option>
                                <option value="month">本月</option>
                            </select>
                        </div>
                        <button id="clear-filters-btn" class="btn btn-secondary btn-sm">清除筛选</button>
                    </div>
                </div>

                <div class="table-container">
                    <table id="messages-table" class="messages-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>姓名</th>
                                <th>邮箱</th>
                                <th>留言内容</th>
                                <th>IP地址</th>
                                <th>提交时间</th>
                                <th class="sticky-right">操作</th>
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
    <div id="message-modal" class="modal" style="display: none;">
        <div class="modal-content">
            <div class="modal-header">
                <h3>表单详情</h3>
                <button class="modal-close" onclick="closeModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div id="message-details"></div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal()">关闭</button>
            </div>
        </div>
    </div>

    <!-- Todo Modal -->
    <div id="todo-modal" class="modal" style="display: none;">
        <div class="modal-content">
            <div class="modal-header">
                <h3>待办事项管理</h3>
                <button class="modal-close" onclick="closeTodoModal()">&times;</button>
            </div>
            <div class="modal-body">
                <form id="todo-form">
                    <div class="form-group">
                        <label for="todo-status">状态:</label>
                        <select id="todo-status" class="form-control" required>
                            <option value="待定">待处理</option>
                            <option value="进行中">处理中</option>
                            <option value="完成">已完成</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="todo-notes">备注:</label>
                        <textarea id="todo-notes" class="form-control" rows="4" placeholder="输入处理备注..."></textarea>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeTodoModal()">取消</button>
                <button class="btn btn-primary" onclick="saveTodo()">保存</button>
            </div>
        </div>
    </div>

    <script>
        // Simple contact messages functionality
        let contactMessages = [];
        let filteredMessages = [];
        
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
                    filteredMessages = [...contactMessages];
                    console.log('Loaded messages:', contactMessages);
                    renderMessages();
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
                tableBody.innerHTML = '<tr><td colspan="7" class="text-center" style="padding: 2rem; color: #666;">没有找到符合条件的产品</td></tr>';
                return;
            }
            
            tableBody.innerHTML = filteredMessages.map(message => `
                <tr class="message-row" data-id="${message.id}">
                    <td class="message-id-cell">${message.id}</td>
                    <td class="message-name-cell">${escapeHtml(message.name)}</td>
                    <td class="message-email-cell">
                        <a href="mailto:${escapeHtml(message.email)}" class="email-link">
                            ${escapeHtml(message.email)}
                        </a>
                    </td>
                    <td class="message-content-cell">
                        <div class="message-preview">
                            ${truncateText(escapeHtml(message.message), 100)}
                        </div>
                    </td>
                    <td class="message-ip-cell">${escapeHtml(message.ip_address || '—')}</td>
                    <td class="message-date-cell">${formatDateTime(message.created_at)}</td>
                    <td class="message-actions-cell sticky-right">
                        <button class="btn btn-sm btn-primary view-btn" onclick="viewMessage(${message.id})" title="查看详情">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-success todo-btn" onclick="openTodoModal(${message.id})" title="待办事项">
                            <i class="fas fa-tasks"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
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
        
        function viewMessage(messageId) {
            const message = contactMessages.find(m => m.id === messageId);
            if (!message) return;
            
            alert(`查看详情: ${message.name}\n邮箱: ${message.email}\n留言: ${message.message}`);
        }
        
        function openTodoModal(messageId) {
            const message = contactMessages.find(m => m.id === messageId);
            if (!message) return;
            
            const status = prompt('请输入状态 (待定/进行中/完成):', message.todo ? message.todo.status : '待定');
            if (status) {
                const notes = prompt('请输入备注:', message.todo ? message.todo.notes || '' : '');
                if (notes !== null) {
                    saveTodo(messageId, status, notes);
                }
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
                    showToast('待办事项已保存', 'success');
                    loadMessages(); // 重新加载数据
                } else {
                    throw new Error(result.message || 'Failed to save todo');
                }
            })
            .catch(error => {
                console.error('Error saving todo:', error);
                showToast('保存失败: ' + error.message, 'error');
            });
        }
        
        // Initialize on page load
        document.addEventListener('DOMContentLoaded', function() {
            console.log('Contact messages page loaded');
            loadMessages();
            
            // Bind refresh button
            const refreshBtn = document.getElementById('refresh-btn');
            if (refreshBtn) {
                refreshBtn.addEventListener('click', loadMessages);
            }
        });
    </script>
</body>
</html>
