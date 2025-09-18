// Contact Messages - Table rendering and functionality

// Render messages (both table and cards)
function renderMessages() {
    const tableBody = document.getElementById('messages-table-body');
    const cardsContainer = document.getElementById('messages-cards');
    if (!tableBody && !cardsContainer) return;
    
    // Render table (desktop)
    if (tableBody) {
        if (filteredMessages.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" class="text-center" style="padding: 2rem; color: #666;">没有找到符合条件的表单数据</td></tr>';
        } else {
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
                                <div class="status-badge status-${message.todo.status} clickable-status" onclick="toggleStatusDropdown(${message.id}, this)">
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
        }
    }

    // Render cards (mobile)
    if (cardsContainer) {
        if (filteredMessages.length === 0) {
            cardsContainer.innerHTML = '<div class="text-center">没有找到符合条件的表单数据</div>';
        } else {
            cardsContainer.innerHTML = filteredMessages.map(message => `
                <div class="message-card" data-id="${message.id}">
                    <div class="message-card__title">${escapeHtml(message.name)}</div>
                    <div class="message-card__row"><a href="mailto:${escapeHtml(message.email)}">${escapeHtml(message.email)}</a></div>
                    <div class="message-card__row">${truncateText(escapeHtml(message.message), 120)}</div>
                    <div class="message-card__meta">
                        <span class="message-card__badge">${formatDateTime(message.created_at)}</span>
                        <span class="message-card__badge">${escapeHtml(message.ip_address || '—')}</span>
                    </div>
                    <div class="message-card__actions">
                        <a class="message-card__btn message-card__btn--primary" href="javascript:void(0)" onclick="viewMessage(${message.id})"><i class="fas fa-eye"></i> 查看</a>
                        <div class="status-dropdown" data-message-id="${message.id}" style="position:relative;">
                            <div class="status-badge status-${message.todo.status} clickable-status" onclick="toggleStatusDropdown(${message.id}, this)">
                                <i class="fas ${getStatusIcon(message.todo.status)}"></i>
                                ${getStatusText(message.todo.status)}
                                <i class="fas fa-chevron-down dropdown-arrow"></i>
                            </div>
                            <div class="status-dropdown-menu" id="dropdown-${message.id}" style="display:none; left:0; transform:none;">
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
                </div>
            `).join('');
        }
    }
    
    // Re-initialize table resize functionality
    if (tableBody) {
        setTimeout(() => { initializeTableResize(); }, 50);
    }
}

// Table resize functionality
function initializeTableResize() {
    loadTableSettings();
    initializeColumnResize();
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
            table.classList.add('resizing');
            
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isResizing || !currentCol) return;
            
            const deltaX = e.clientX - startX;
            const newWidth = Math.max(50, Math.min(500, startWidth + deltaX));
            currentCol.style.width = newWidth + 'px';
        });
        
        document.addEventListener('mouseup', () => {
            if (isResizing) {
                isResizing = false;
                handle.classList.remove('active');
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
                table.classList.remove('resizing');
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
            const newHeight = Math.max(40, startHeight + deltaY);
            row.style.height = newHeight + 'px';
        });
        
        document.addEventListener('mouseup', () => {
            if (isResizing) {
                isResizing = false;
                handle.classList.remove('active');
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
                saveTableSettings();
            }
        });
    });
}

// Save table settings
function saveTableSettings() {
    const settings = {
        columnWidths: {},
        defaultRowHeight: 60
    };
    
    const table = document.getElementById('messages-table');
    const colgroup = table.querySelector('colgroup');
    const cols = colgroup.querySelectorAll('col');
    const columnNames = ['name', 'email', 'message', 'status', 'notes', 'date'];
    
    cols.forEach((col, index) => {
        if (columnNames[index]) {
            settings.columnWidths[columnNames[index]] = col.style.width || col.offsetWidth + 'px';
        }
    });
    
    const firstRow = document.querySelector('.resizable-row');
    if (firstRow) {
        settings.defaultRowHeight = parseInt(firstRow.style.height) || 60;
    }
    
    localStorage.setItem('contactMessagesTableSettings', JSON.stringify(settings));
}

// Load table settings
function loadTableSettings() {
    const savedSettings = localStorage.getItem('contactMessagesTableSettings');
    if (!savedSettings) return;
    
    try {
        const settings = JSON.parse(savedSettings);
        
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
        
        if (settings.defaultRowHeight) {
            document.querySelectorAll('.resizable-row').forEach(row => {
                row.style.height = settings.defaultRowHeight + 'px';
            });
        }
    } catch (e) {
        console.error('Error loading table settings:', e);
    }
}

// Reset table settings
function resetTableSettings() {
    localStorage.removeItem('contactMessagesTableSettings');
    
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

// Inline notes editing
function startEditNotes(messageId) {
    const cell = document.querySelector(`.notes-cell[ondblclick="startEditNotes(${messageId})"]`);
    const contentDiv = cell.querySelector('.notes-content');
    const currentNotes = contentDiv.textContent || '';
    
    const textarea = document.createElement('textarea');
    textarea.className = 'notes-edit-input';
    textarea.value = currentNotes;
    textarea.placeholder = '输入备注内容...';
    
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
    
    cell.innerHTML = '';
    cell.appendChild(textarea);
    cell.appendChild(actionsDiv);
    
    textarea.focus();
    textarea.select();
    
    textarea.style.height = 'auto';
    const contentHeight = textarea.scrollHeight;
    textarea.style.height = Math.max(20, Math.min(contentHeight, 60)) + 'px';
    
    textarea.addEventListener('input', function() {
        this.style.height = 'auto';
        const newHeight = this.scrollHeight;
        this.style.height = Math.max(20, Math.min(newHeight, 60)) + 'px';
    });
    
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

function saveInlineNotes(messageId) {
    const cell = document.querySelector(`.notes-cell[ondblclick="startEditNotes(${messageId})"]`);
    const textarea = cell.querySelector('.notes-edit-input');
    const newNotes = textarea.value.trim();
    
    const message = contactMessages.find(m => m.id === messageId);
    if (!message) return;
    
    saveTodo(messageId, message.todo.status, newNotes);
    
    cell.innerHTML = `
        <div class="notes-content" data-message-id="${messageId}">
            ${newNotes ? escapeHtml(newNotes) : ''}
        </div>
    `;
}

function cancelEditNotes(messageId) {
    const cell = document.querySelector(`.notes-cell[ondblclick="startEditNotes(${messageId})"]`);
    const message = contactMessages.find(m => m.id === messageId);
    if (!message) return;
    
    cell.innerHTML = `
        <div class="notes-content" data-message-id="${messageId}">
            ${message.todo.notes ? escapeHtml(message.todo.notes) : ''}
        </div>
    `;
}

// Click outside to cancel editing
document.addEventListener('click', function(e) {
    if (!e.target.closest('.notes-edit-actions') && !e.target.closest('.notes-edit-input')) {
        const editingCells = document.querySelectorAll('.notes-cell');
        editingCells.forEach(cell => {
            if (cell.querySelector('.notes-edit-input')) {
                const messageId = cell.getAttribute('ondblclick').match(/startEditNotes\((\d+)\)/)[1];
                cancelEditNotes(parseInt(messageId));
            }
        });
    }
});
                                    <span>已完成</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }
    
    // Re-initialize table resize functionality
    if (tableBody) {
        setTimeout(() => { initializeTableResize(); }, 50);
    }
}

// Table resize functionality
function initializeTableResize() {
    loadTableSettings();
    initializeColumnResize();
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
            table.classList.add('resizing');
            
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isResizing || !currentCol) return;
            
            const deltaX = e.clientX - startX;
            const newWidth = Math.max(50, Math.min(500, startWidth + deltaX));
            currentCol.style.width = newWidth + 'px';
        });
        
        document.addEventListener('mouseup', () => {
            if (isResizing) {
                isResizing = false;
                handle.classList.remove('active');
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
                table.classList.remove('resizing');
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
            const newHeight = Math.max(40, startHeight + deltaY);
            row.style.height = newHeight + 'px';
        });
        
        document.addEventListener('mouseup', () => {
            if (isResizing) {
                isResizing = false;
                handle.classList.remove('active');
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
                saveTableSettings();
            }
        });
    });
}

// Save table settings
function saveTableSettings() {
    const settings = {
        columnWidths: {},
        defaultRowHeight: 60
    };
    
    const table = document.getElementById('messages-table');
    const colgroup = table.querySelector('colgroup');
    const cols = colgroup.querySelectorAll('col');
    const columnNames = ['name', 'email', 'message', 'status', 'notes', 'date'];
    
    cols.forEach((col, index) => {
        if (columnNames[index]) {
            settings.columnWidths[columnNames[index]] = col.style.width || col.offsetWidth + 'px';
        }
    });
    
    const firstRow = document.querySelector('.resizable-row');
    if (firstRow) {
        settings.defaultRowHeight = parseInt(firstRow.style.height) || 60;
    }
    
    localStorage.setItem('contactMessagesTableSettings', JSON.stringify(settings));
}

// Load table settings
function loadTableSettings() {
    const savedSettings = localStorage.getItem('contactMessagesTableSettings');
    if (!savedSettings) return;
    
    try {
        const settings = JSON.parse(savedSettings);
        
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
        
        if (settings.defaultRowHeight) {
            document.querySelectorAll('.resizable-row').forEach(row => {
                row.style.height = settings.defaultRowHeight + 'px';
            });
        }
    } catch (e) {
        console.error('Error loading table settings:', e);
    }
}

// Reset table settings
function resetTableSettings() {
    localStorage.removeItem('contactMessagesTableSettings');
    
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

// Inline notes editing
function startEditNotes(messageId) {
    const cell = document.querySelector(`.notes-cell[ondblclick="startEditNotes(${messageId})"]`);
    const contentDiv = cell.querySelector('.notes-content');
    const currentNotes = contentDiv.textContent || '';
    
    const textarea = document.createElement('textarea');
    textarea.className = 'notes-edit-input';
    textarea.value = currentNotes;
    textarea.placeholder = '输入备注内容...';
    
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
    
    cell.innerHTML = '';
    cell.appendChild(textarea);
    cell.appendChild(actionsDiv);
    
    textarea.focus();
    textarea.select();
    
    textarea.style.height = 'auto';
    const contentHeight = textarea.scrollHeight;
    textarea.style.height = Math.max(20, Math.min(contentHeight, 60)) + 'px';
    
    textarea.addEventListener('input', function() {
        this.style.height = 'auto';
        const newHeight = this.scrollHeight;
        this.style.height = Math.max(20, Math.min(newHeight, 60)) + 'px';
    });
    
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

function saveInlineNotes(messageId) {
    const cell = document.querySelector(`.notes-cell[ondblclick="startEditNotes(${messageId})"]`);
    const textarea = cell.querySelector('.notes-edit-input');
    const newNotes = textarea.value.trim();
    
    const message = contactMessages.find(m => m.id === messageId);
    if (!message) return;
    
    saveTodo(messageId, message.todo.status, newNotes);
    
    cell.innerHTML = `
        <div class="notes-content" data-message-id="${messageId}">
            ${newNotes ? escapeHtml(newNotes) : ''}
        </div>
    `;
}

function cancelEditNotes(messageId) {
    const cell = document.querySelector(`.notes-cell[ondblclick="startEditNotes(${messageId})"]`);
    const message = contactMessages.find(m => m.id === messageId);
    if (!message) return;
    
    cell.innerHTML = `
        <div class="notes-content" data-message-id="${messageId}">
            ${message.todo.notes ? escapeHtml(message.todo.notes) : ''}
        </div>
    `;
}

// Click outside to cancel editing
document.addEventListener('click', function(e) {
    if (!e.target.closest('.notes-edit-actions') && !e.target.closest('.notes-edit-input')) {
        const editingCells = document.querySelectorAll('.notes-cell');
        editingCells.forEach(cell => {
            if (cell.querySelector('.notes-edit-input')) {
                const messageId = cell.getAttribute('ondblclick').match(/startEditNotes\((\d+)\)/)[1];
                cancelEditNotes(parseInt(messageId));
            }
        });
    }
});
