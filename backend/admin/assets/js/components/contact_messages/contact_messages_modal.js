// Contact Messages - Modal functionality

// View message in modal
function viewMessage(messageId) {
    const message = contactMessages.find(m => m.id === messageId);
    if (!message) return;
    
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
    
    initializeNotesEditing();
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

// Close modal
function closeModal() {
    const modal = document.getElementById('message-modal');
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
        currentModalMessageId = null;
    }
}

// Initialize notes editing in modal
function initializeNotesEditing() {
    const notesTextarea = document.getElementById('modal-notes-textarea');
    if (!notesTextarea) return;
    
    let saveTimeout;
    
    notesTextarea.addEventListener('input', function() {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => { saveNotesFromModal(); }, 1000);
    });
    
    notesTextarea.addEventListener('blur', function() {
        clearTimeout(saveTimeout);
        saveNotesFromModal();
    });
}

// Save notes from modal
function saveNotesFromModal() {
    if (!currentModalMessageId) return;
    
    const notesTextarea = document.getElementById('modal-notes-textarea');
    if (!notesTextarea) return;
    
    const message = contactMessages.find(m => m.id === currentModalMessageId);
    if (!message) return;
    
    const newNotes = notesTextarea.value.trim();
    const currentNotes = message.todo ? message.todo.notes || '' : '';
    
    if (newNotes === currentNotes) return;
    
    const currentStatus = message.todo ? message.todo.status : '待定';
    saveTodo(currentModalMessageId, currentStatus, newNotes);
}

// Toggle modal status dropdown
function toggleModalStatusDropdown(messageId) {
    document.querySelectorAll('.status-dropdown-menu').forEach(menu => {
        if (menu.id !== `modal-dropdown-${messageId}`) {
            menu.style.display = 'none';
        }
    });
    
    document.querySelectorAll('.clickable-status').forEach(status => {
        status.classList.remove('active');
    });
    
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

// Update status from modal
function updateStatusFromModal(messageId, newStatus) {
    const message = contactMessages.find(m => m.id === messageId);
    if (!message) return;
    
    const dropdown = document.getElementById(`modal-dropdown-${messageId}`);
    const statusBadge = document.querySelector(`[data-message-id="${messageId}"] .clickable-status`);
    if (dropdown) dropdown.style.display = 'none';
    if (statusBadge) statusBadge.classList.remove('active');
    
    const currentNotes = message.todo ? message.todo.notes || '' : '';
    saveTodo(messageId, newStatus, currentNotes);
}

// Update modal display
function updateModalDisplay() {
    if (!currentModalMessageId) return;
    
    const message = contactMessages.find(m => m.id === currentModalMessageId);
    if (!message) return;
    
    // Update status display
    const statusBadge = document.querySelector(`[data-message-id="${currentModalMessageId}"] .clickable-status`);
    if (statusBadge) {
        statusBadge.className = `status-badge status-${message.todo.status} clickable-status`;
        statusBadge.innerHTML = `
            <i class="fas ${getStatusIcon(message.todo.status)}"></i>
            ${getStatusText(message.todo.status)}
            <i class="fas fa-chevron-down dropdown-arrow"></i>
        `;
    }
    
    // Update notes display
    const notesTextarea = document.getElementById('modal-notes-textarea');
    if (notesTextarea) {
        notesTextarea.value = message.todo.notes || '';
    }
}

// Setup modal event listeners
function setupModalEventListeners() {
    // Click outside modal to close
    document.addEventListener('click', function(event) {
        const modal = document.getElementById('message-modal');
        if (event.target === modal) {
            closeModal();
        }
    });
    
    // ESC key to close modal
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeModal();
        }
    });
}
